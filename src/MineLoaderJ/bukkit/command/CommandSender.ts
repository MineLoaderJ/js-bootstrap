import { JavaObject, Method } from "../../../Java"
import Pointer from "../../../Pointer"

export class CommandSender extends JavaObject {
  private static _sendMessage: Method
  constructor({ name, pointer }: { name: string, pointer: Pointer }) {
    super({ name, pointer })
    if(!CommandSender._sendMessage) {
      this.init()
      let method: Method | Method[] = this.getClass().methods.sendMessage
      if(method instanceof Array) {
        for(let m of method) {
          if(m.argumentTypes.length == 1 && m.argumentTypes[0] == 'java.lang.String') {
            CommandSender._sendMessage = m
            break
          }
        }
      } else CommandSender._sendMessage = method
    }
  }

  sendMessage(...args: string[]) {
    CommandSender._sendMessage.invoke(this, [ args.join(' ') ])
  }
}

export default CommandSender