/**
 * The game object class for temporary data that is not included in save data
 */
class Game_Temp {
  private _commonEventId: number
  private _destinationX?: number
  private _destinationY?: number
  private _isPlaytest: boolean

  constructor() {
    this._commonEventId = 0
    this._isPlaytest = Utils.isOptionValid('test')
  }

  public clearCommonEvent() {
    this._commonEventId = 0
  }

  public isCommonEventReserved() {
    return this._commonEventId > 0
  }

  public isPlaytest() {
    return this._isPlaytest
  }

  public reserveCommonEvent(commonEventId: number) {
    this._commonEventId = commonEventId
  }
}
