export class ChatColor {
  static COLOR_CHAR = '§'
  static BLACK: ChatColor         = new ChatColor({ code: "0", intCode: 0, isFormat: false })
  static DARK_BLUE: ChatColor     = new ChatColor({ code: "1", intCode: 1, isFormat: false })
  static DARK_GREEN: ChatColor    = new ChatColor({ code: "2", intCode: 2, isFormat: false })
  static DARK_AQUA: ChatColor     = new ChatColor({ code: "3", intCode: 3, isFormat: false })
  static DARK_RED: ChatColor      = new ChatColor({ code: "4", intCode: 4, isFormat: false })
  static DARK_PURPLE: ChatColor   = new ChatColor({ code: "5", intCode: 5, isFormat: false })
  static GOLD: ChatColor          = new ChatColor({ code: "6", intCode: 6, isFormat: false })
  static GRAY: ChatColor          = new ChatColor({ code: "7", intCode: 7, isFormat: false })
  static DARK_GRAY: ChatColor     = new ChatColor({ code: "8", intCode: 8, isFormat: false })
  static BLUE: ChatColor          = new ChatColor({ code: "9", intCode: 9, isFormat: false })
  static GREEN: ChatColor         = new ChatColor({ code: "a", intCode: 10, isFormat: false })
  static AQUA: ChatColor          = new ChatColor({ code: "b", intCode: 11, isFormat: false })
  static RED: ChatColor           = new ChatColor({ code: "c", intCode: 12, isFormat: false })
  static LIGHT_PURPLE: ChatColor  = new ChatColor({ code: "d", intCode: 13, isFormat: false })
  static YELLOW: ChatColor        = new ChatColor({ code: "e", intCode: 14, isFormat: false })
  static WHITE: ChatColor         = new ChatColor({ code: "f", intCode: 15, isFormat: false })
  static MAGIC: ChatColor         = new ChatColor({ code: "k", intCode: 16, isFormat: false })
  static BOLD: ChatColor          = new ChatColor({ code: "l", intCode: 17, isFormat: false })
  static STRIKETHROUGH: ChatColor = new ChatColor({ code: "m", intCode: 18, isFormat: false })
  static UNDERLINE: ChatColor     = new ChatColor({ code: "n", intCode: 19, isFormat: false })
  static ITALIC: ChatColor        = new ChatColor({ code: "o", intCode: 20, isFormat: false })
  static RESET: ChatColor         = new ChatColor({ code: "r", intCode: 21, isFormat: false })

  code: string
  intCode: number
  isFormat: boolean
  string: string

  constructor({ code, intCode, isFormat }: { code: string, intCode: number, isFormat: boolean }) {
    this.code = code
    this.intCode = intCode
    this.isFormat = isFormat
    this.string = ChatColor.COLOR_CHAR + code
  }

  toString() {
    return this.string
  }

  valueOf() {
    return this.string
  }
}

export default ChatColor