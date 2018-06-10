'use strict'
const ActionHero = require('actionhero')

module.exports = class MyTask extends ActionHero.Task {
  constructor () {
    super()
    this.name = 'fast-task'
    this.description = 'an actionhero task'
    this.frequency = 1000
    this.queue = 'default'
    this.middleware = []
  }

  async sleep (time = 1000) {
    return new Promise((resolve) => {
      setTimeout(resolve, time)
    })
  }

  async run (data) {
    await this.sleep(1 * 1000)
  }
}
