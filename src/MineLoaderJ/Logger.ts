export class Logger {
  name: string
  prefix: string
  constructor(name?: string) {
    this.name = name
    this.prefix = name && name.length ? `[${name}] ` : ''
  }

  /**
   * @description Write severe logging message.
   * @param messages Logging message.
   */
  severe(...messages) {
    __MINE_LOADER_J_logSEVERE(`\u001b[31m${this.prefix}${messages.join(' ')}\u001b[0m`)
  }

  /**
   * @description Alias of `severe`.
   * @param messages Logging message.
   */
  err(...messages) {
    __MINE_LOADER_J_logSEVERE(`\u001b[31m${this.prefix}${messages.join(' ')}\u001b[0m`)
  }

  /**
   * @description Alias of `severe`.
   * @param messages Logging message.
   */
  error(...messages) {
    __MINE_LOADER_J_logSEVERE(`\u001b[31m${this.prefix}${messages.join(' ')}\u001b[0m`)
  }

  /**
   * @description Write warning logging message.
   * @param messages Logging message.
   */
  warning(...messages) {
    __MINE_LOADER_J_logWARNING(`\u001b[33m${this.prefix}${messages.join(' ')}\u001b[0m`)
  }

  /**
   * @description Alias of `warning`.
   * @param messages Logging message.
   */
  warn(...messages) {
    __MINE_LOADER_J_logWARNING(`\u001b[33m${this.prefix}${messages.join(' ')}\u001b[0m`)
  }

  /**
   * @description Write info logging message.
   * @param messages Logging message.
   */
  info(...messages) {
    __MINE_LOADER_J_logINFO(this.prefix + messages.join(' '))
  }

  /**
   * @description Write config logging message.
   * @param messages Logging message.
   */
  config(...messages) {
    __MINE_LOADER_J_logCONFIG(this.prefix + messages.join(' '))
  }

  /**
   * @description Write fine logging message.
   * @param messages Logging message.
   */
  fine(...messages) {
    __MINE_LOADER_J_logFINE(this.prefix + messages.join(' '))
  }

  /**
   * @description Alias of `fine`.
   * @param messages Logging message.
   */
  verbose(...messages) {
    __MINE_LOADER_J_logFINE(this.prefix + messages.join(' '))
  }

  /**
   * @description Write finer logging message.
   * @param messages Logging message.
   */
  finer(...messages) {
    __MINE_LOADER_J_logFINER(this.prefix + messages.join(' '))
  }

  /**
   * @description Write finest logging message.
   * @param messages Logging message.
   */
  finest(...messages) {
    __MINE_LOADER_J_logFINEST(this.prefix + messages.join(' '))
  }
}

export default Logger