import JavaObject from '../Java/JavaObject'
import JavaClass from '../Java/JavaClass'
import Pointer from '../Pointer'
import Method from '../Java/Method'
import _ChatColor from './bukkit/ChatColor'
import _Logger from './Logger'
import { inspect } from 'util'
import promisify from '../helpers/promise'
import { dirname, join } from 'path'
import { EventEmitter } from 'events'
import * as assert from 'assert'
import * as fs from 'fs'
import { CommandSender } from './bukkit/command/CommandSender'
import { Player } from './bukkit/entity/Player'
import * as bukkit from './bukkit'
import * as helpers from './helpers'


declare global {
  // Emit `enable` event on next tick when loaded
  const onDisable: Function  // onDisable hook
  const __INSPECT: Function
  const onCommand: Function
}
export interface CommandDescription {
  description: string
  usage: string
  aliases: string[]
  onCommand: (sender: CommandSender, commandName: string, args: string[]) => boolean
  plugin?: Plugin
}
export interface CommandDescriptions {
  [commandName: string]: CommandDescription
}
export interface Plugin {
  init(instance: MineLoaderJ, logger: _Logger): void
  name: string
  logger: _Logger
  commands: CommandDescriptions
}
export class MineLoaderJ extends EventEmitter {
  static ChatColor: typeof _ChatColor = _ChatColor
  static bukkit = bukkit
  static helpers = helpers
  static Logger: typeof _Logger = _Logger
  static instance: MineLoaderJ
  pluginInstance: JavaObject
  server: JavaObject
  Server: JavaClass
  consoleSender: JavaObject
  ConsoleSender: JavaClass
  sendMessage: Method
  static jarPath: string = process.platform == 'darwin' ? join('/', __UTIL_getPath()) : __UTIL_getPath()
  static path: string = dirname(MineLoaderJ.jarPath)
  static pluginDirectoryName: string = 'MineLoaderJ'
  static pluginPath: string = join(MineLoaderJ.path, MineLoaderJ.pluginDirectoryName)

  logger: _Logger = new _Logger

  static ENABLE: string = 'enable'
  static DISABLE: string = 'disable'
  // static COMMAND: string = 'command'

  plugins: Plugin[] = []
  commands: CommandDescriptions = {}
  
  /**
   * @description Don't instantiate this class manually!
   */
  constructor() {
    super()
    MineLoaderJ.instance = this

    let pointer = __MINE_LOADER_J_getPluginInstance()
    this.pluginInstance = new JavaObject({
      name: 'MineLoaderJ.instance',
      pointer: new Pointer(pointer, 'MineLoaderJ.instance')
    }).init()
    if(!(this.pluginInstance.class.methods.getServer instanceof Array)) {
      this.server = this.pluginInstance.class.methods.getServer.invoke(this.pluginInstance, []).init()
    }

    this.Server = this.server.getClass()
    if(!(this.Server.methods.getConsoleSender instanceof Array)) {
      this.consoleSender = this.Server.methods.getConsoleSender.invoke(this.server, []).init()
    }

    this.ConsoleSender = this.consoleSender.getClass()
    if(this.ConsoleSender.methods.sendMessage instanceof Array) {
      for(let method of this.ConsoleSender.methods.sendMessage) {
        if(method.argumentTypes.length == 1 && method.argumentTypes[0] == 'java.lang.String') {
          this.sendMessage = method
          break
        }
      }
    } else {
      this.sendMessage = this.ConsoleSender.methods.sendMessage
    }

    this.registerGlobalFunctions()

    // TODO: Load modules
    this.loadPlugins()

    const handler = MineLoaderJ.getOnUncaughtErrorHandler(this)
    process.on('uncaughtException', handler)
    process.on('unhandledRejection', handler)
  }

  private static getOnUncaughtErrorHandler(self: MineLoaderJ) {
    return function onUncaughtError(err: Error) {
      self.logger.err(`An error/rejection has occurred and was not caught: ${err && (err.stack || err.message) || 'unknown error'}`)
    }
  }

  private registerGlobalFunctions() {
    // Register `__INSPECT`
    function __INSPECT(obj: any, colors: boolean) {
      return inspect(obj, { colors: colors, maxArrayLength: 20 })
    }
    Object.defineProperty(global, '__INSPECT', {
      enumerable: true,
      writable: false,
      configurable: true,
      value: __INSPECT
    })

    const self: MineLoaderJ = this
    // Register `onDisable` hook
    function onDisable() {
      self.emit(MineLoaderJ.DISABLE)
      self.logger.info('`disable` event emitted')
    }
    Object.defineProperty(global, 'onDisable', {
      enumerable: true,
      writable: false,
      configurable: true,
      value: onDisable
    })

    // Register `onCommand` hook
    function onCommand(senderPointer: RawPointer, commandName: string, args: string[]) {
      if(!(commandName in self.commands)) return
      /*
      const name: string = `commandSender@${senderPointer}`
      let sender: any = new JavaObject({
        name,
        pointer: new Pointer(senderPointer, name)
      }).init()
      let sendMessage: Method | Method[] = sender.getClass().methods.sendMessage
      if(sendMessage instanceof Array) {
        for(let m of sendMessage) {
          if(m.argumentTypes.length == 1 && m.argumentTypes[0] == 'java.lang.String') {
            sendMessage = m
            break
          }
        }
      }
      function _sendMessage(...args: string[]) {
        (sendMessage as Method).invoke(sender, [ args.join(' ') ])
      }
      sender.sendMessage = _sendMessage
      */
      const name: string = `commandSender@${senderPointer}`
      let sender: CommandSender
      if(__REFLECTOR_getTypeNameOfObject(senderPointer, '').match(/Player$/)) {
        const _name: string = `player@${senderPointer}`
        sender = new Player({
          name,
          pointer: new Pointer(senderPointer, name)
        })
      } else {
        sender = new CommandSender({
          name,
          pointer: new Pointer(senderPointer, name)
        })
      }
      if(!self.commands[commandName].onCommand(sender, commandName, args)) {
        sender.sendMessage(`Usage: ${self.commands[commandName].usage}`)
      }
      // self.emit(MineLoaderJ.COMMAND, sender as JavaObject & { sendMessage(...args: string[]): void }, commandName, args, (successful: boolean) => {
      //   // onFinish handler
      //   if(!successful) {
      //     (sender.sendMessage as typeof _sendMessage)(`Usage: ${self.commands[commandName].usage}`)
      //   }
      // })
      sender.destroy()
      // self.logger.info('`command` event emitted')
    }
    Object.defineProperty(global, 'onCommand', {
      enumerable: true,
      writable: false,
      configurable: true,
      value: onCommand
    })
  }

  private async loadPlugins(callback?: () => void) {
    const readdir = promisify(fs.readdir)
    const mkdir = promisify(fs.mkdir)
    const stat = promisify(fs.stat)
    let pluginNames: string[]
    this.logger.info('Loading js plugins...')
    try {
      let info = await stat(MineLoaderJ.pluginPath)
      assert(info && info.isDirectory())
    } catch(err) {
      // Doesn't exist or is not a directory
      this.logger.info('Plugin directory doesn\'t exist, creating...')
      try {
        await mkdir(MineLoaderJ.pluginPath)
      } catch(err) {
        this.logger.err(`Unable to create a directory for plugins: ${err && (err.stack || err.message) || 'unknonw error'}`)
        return
      }
    }
    try {
      pluginNames = await readdir(MineLoaderJ.pluginPath)
    } catch(err) {
      this.logger.err(`Unable to open plugin directory: ${err && (err.stack || err.message) || 'unknonw error'}`)
      return
    }
    for(let pluginName of pluginNames) {
      if(pluginName == 'node_modules') continue
      let plugin: Plugin
      try {
        plugin = require(join(MineLoaderJ.pluginPath, pluginName))
        assert(plugin.name)
        plugin.logger = new _Logger(plugin.name)
        plugin.init(this, plugin.logger)  // Plugins must listen to `enable` and `disable` events; plugins must resolve command conflict
        // Register commands
        let commands: string[]
        if(plugin.commands && (commands = Object.keys(plugin.commands)).length) {
          for(let command of commands) {
            if(typeof plugin.commands[command].onCommand != 'function') {
              this.logger.err(`No \`onCommand\` handler for command: ${command}`)
              throw new Error('No \`onCommand\` handler')
            }
            if(command in this.commands) {
              this.logger.err(`Conflict command: ${command}`)
              throw new Error('Conflict command')
            }
          }
          for(let command of commands) {
            plugin.commands[command].plugin = plugin  // Circular
            this.commands[command] = plugin.commands[command]
          }
        }
        this.plugins.push(plugin)
        this.logger.info(`\u001b[36mPlugin loaded: ${plugin.name}\u001b[0m`)
      } catch(err) {
        this.logger.warn(`Skipped file/directory: ${pluginName} (${(err as Error).name}:${(err as Error).message})`)
        this.logger.finer(`Reason ${err && (err.stack || err.message) || 'unknown'}`)
      }
    }
    if(!this.plugins.length) this.logger.warn('No js plugins are loaded')

    // Emit `enable` event
    this.emit(MineLoaderJ.ENABLE)
    this.logger.info('`enable` event emitted')
  }

  /**
   * @description Send messages directly to the console.
   * @param messages Messages to send.
   */
  sendMessageToConsole(...messages) {
    // this.sendMessage.invoke(this.consoleSender, [ args.join(' ') ])
    __MINE_LOADER_J_sendMessage(messages.join(' '))
  }

  /**
   * @description Broadcast message to whole server.
   * @param messages Message to broadcast.
   */
  broadcastMessage(...messages) {
    __MINE_LOADER_J_broadcastMessage(messages.join(' '))
  }
}

new MineLoaderJ

export default MineLoaderJ