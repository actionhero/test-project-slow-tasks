'use strict'
const ActionHero = require('actionhero')

module.exports = class MyAction extends ActionHero.Action {
  constructor () {
    super()
    this.name = 'taskSpawn'
    this.description = 'an actionhero action'
    this.outputExample = {}
  }

  async run (data) {
    let i = 0
    while (i < 100) {
      await ActionHero.api.tasks.enqueue('randomNumberTask', {}, 'default')
      i++
    }
  }
}
