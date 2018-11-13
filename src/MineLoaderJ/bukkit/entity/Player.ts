import CommandSender from "../command/CommandSender"
import Pointer from "../../../Pointer"
import { Method } from "../../../Java"

export class Player extends CommandSender {
  private static _getWorld: Method
  constructor({ name, pointer }: { name: string, pointer: Pointer }) {
    super({ name, pointer })
    if(!Player._getWorld) {
      if(!this.getClass() || !this.getClass().methods) this.init()
      let method: Method | Method[] = this.getClass().methods.getWorld
      if(method instanceof Array) {
        for(let m of method) {
          if(m.argumentTypes.length == 1 && m.argumentTypes[0] == '') {
            Player._getWorld = m
            break
          }
        }
      } else Player._getWorld = method
    }
  }

  getWorld() {
    return Player._getWorld.invoke(this, [])
  }
}