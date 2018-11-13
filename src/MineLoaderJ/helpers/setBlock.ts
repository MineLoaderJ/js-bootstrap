import { JavaObject, JavaClass, Method } from "../../Java"
import * as assert from "assert"

const Block: JavaClass = JavaClass.forName('tk.a0x00000000.MineLoaderJ.block.Block').init()
const method: Method = Block.methods.setBlock as Method

export function setBlock(world: JavaObject, x: number, y: number, z: number, material: string, data: number = 0x00) {
  assert(0 <= data && data < 256, 'Block data out of range')
  method.invoke(Block, [ world || null, x, y, z, material, data ])
}