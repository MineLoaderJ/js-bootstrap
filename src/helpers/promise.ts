import { promisify as _promisify } from 'util'


export let promisify: typeof _promisify
promisify = ((fun: (...args: any[]) => any) => {
  let prom: any = function(...args: any[]) {
    return new Promise((resolve, reject) => {
      fun(...args, (err, result) => {
        if(err) reject(err)
        else resolve(result)
      })
    })
  }
  prom.name = (fun as any).name
  return prom as (...args: any) => Promise<any>
}) as any

export default promisify