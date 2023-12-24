module.exports = new Proxy({
  initAPI() {
    return true
  },
  getAchievementNames() {
    return []
  }
}, {
    get(o, k) {
        if(k in o) {
            return (o as any)[k]
        }
        return (...args: any) => console.log("greenworks needs stub for", k.toString() + "(", args, ")");
    }
});