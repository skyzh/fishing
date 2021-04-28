const _ = require('lodash')
const $ = require('jquery')
const d3 = require('d3')

const fishSvg = require('./fish.svg')
const hookSvg = require('./hook.svg')
const MAX_FISH = 50

$.when($.ready).then(() => {
  const svg = d3.select("#fishing")
    .append("svg")
    .attr("width", "800")
    .attr("height", "600")

  const generateFish = (firstIter) => ({
    x: firstIter ? _.random(0, 800) : -20,
    y: _.random(200, 600),
    speed: _.random(3, 7, true)
  })

  let fish = _.range(MAX_FISH)
    .map(() => generateFish(true))

  let frameCnt = 0
  let poleFrame = null

  let poleMaxY = 300
  let poleX = 400

  let score = 0

  $("#fishing").on('click', function (event) {
    if (!poleFrame) {
      poleFrame = frameCnt
      poleMaxY = event.offsetY
      poleX = event.offsetX
    }
  })

  const fishSize = 30

  const applyFish = sel => sel
    .attr("x", f => f.x)
    .attr("y", f => f.y)

  const createFish = sel => applyFish(
    sel
      .append("image")
      .attr("class", "fish")
      .attr("width", fishSize)
      .attr("height", fishSize)
      .attr("href", fishSvg))

  const poleStayTime = 300
  const poleSpeed = 3

  const poleY = () => {
    if (!poleFrame) return -5;
    if (frameCnt - poleFrame < poleMaxY / poleSpeed) return (frameCnt - poleFrame) * poleSpeed
    if (frameCnt - poleFrame < poleMaxY / poleSpeed + poleStayTime) return poleMaxY
    const finalValue = poleMaxY - (frameCnt - poleFrame - (poleMaxY / poleSpeed + poleStayTime)) * poleSpeed
    if (finalValue < -5) poleFrame = null
    return finalValue
  }

  const createPole = svg => svg
    .append("image")
    .attr("x", poleX - 10)
    .attr("y", poleY)
    .attr("width", 20)
    .attr("href", hookSvg)

  const updatePole = pole => pole
    .attr("x", poleX - 10)
    .attr("y", () => poleY() - 15)

  const pole = createPole(svg)

  const updateFrame = () => {
    const checkPoleY = poleY()
    fish = _.map(fish, f => ({
      ...f,
      x: f.x + f.speed,
    }))
      .filter(f => f.x < 800)
    const fishCount = fish.length
    fish = fish.filter(f => !(f.y <= checkPoleY && checkPoleY <= f.y + fishSize
      && f.x <= poleX && poleX <= f.x + fishSize))
    score += fishCount - fish.length
    $("#score").text(`${score}`)

    if (fish.length < MAX_FISH) {
      fish = _.concat(
        fish,
        _.range(MAX_FISH - fish.length).map(() => generateFish()))
    }

    // update fish
    const fishSelection = svg.selectAll(".fish").data(fish)
    fishSelection.exit().remove()
    createFish(fishSelection.enter())
    applyFish(fishSelection)

    // update pole
    updatePole(pole)

    frameCnt += 1
    requestAnimationFrame(updateFrame)
  }

  requestAnimationFrame(updateFrame)
})
