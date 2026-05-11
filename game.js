var flyImgs = ["fly1.png", "fly2.png", "fly4.png", "fly5.png"]
var LIVES = 3
var TIMER_BASE = 13
var TIMER_MIN = 4.5

// grab everything
var arena = document.getElementById("arena")
var inp = document.getElementById("inp")
var fill = document.getElementById("fill")
var bar = document.getElementById("bar")

var hRnd = document.getElementById("h-rnd")
var hStr = document.getElementById("h-str")
var hBest = document.getElementById("h-best")
var hLives = document.getElementById("h-lives")

var msgEl = document.getElementById("msg")
var msgIcon = document.getElementById("msg-icon")
var msgText = document.getElementById("msg-text")
var msgSub = document.getElementById("msg-sub")

var deadEl = document.getElementById("dead")
var deadInfo = document.getElementById("dead-info")
var dStr = document.getElementById("d-str")
var dBest = document.getElementById("d-best")
var dRnd = document.getElementById("d-rnd")

var menuEl = document.getElementById("menu")
var gameEl = document.getElementById("game")
var menuBest = document.getElementById("menu-best")

// state
var rnd = 0, streak = 0, numFlies = 0, lives = LIVES
var best = parseInt(localStorage.getItem("fly_best")) || 0
var timer = null, timeLeft = 0
var chill = false

// preload
flyImgs.forEach(function(s) { new Image().src = s })

// utils
function ri(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a }

function hearts(n) {
    var s = ""
    for (var i = 0; i < LIVES; i++) s += i < n ? "♥" : "♡"
    return s
}

function saveBest() {
    localStorage.setItem("fly_best", best)
}

// show/hide
function showMenu() {
    menuEl.classList.remove("off")
    gameEl.classList.add("off")
    msgEl.classList.add("off")
    deadEl.classList.add("off")
    menuBest.textContent = best > 0 ? "best streak: " + best : ""
}

function showGame() {
    menuEl.classList.add("off")
    gameEl.classList.remove("off")
}

function updateHud() {
    hRnd.textContent = rnd
    hStr.textContent = streak
    hBest.textContent = best
    hLives.textContent = hearts(lives)
}

// timer
function getTime() {
    var t = TIMER_BASE - rnd * 0.45
    return t < TIMER_MIN ? TIMER_MIN : t
}

function startTimer() {
    clearInterval(timer)
    if (chill) {
        bar.style.display = "none"
        return
    }
    bar.style.display = ""
    var dur = getTime()
    timeLeft = dur
    fill.style.width = "100%"
    fill.className = ""

    timer = setInterval(function() {
        timeLeft -= 0.05
        var pct = timeLeft / dur * 100
        if (pct < 0) pct = 0
        fill.style.width = pct + "%"

        if (pct < 20) fill.className = "crit"
        else if (pct < 40) fill.className = "warn"
        else fill.className = ""

        if (timeLeft <= 0) {
            clearInterval(timer)
            timeout()
        }
    }, 50)
}

function stopTimer() { clearInterval(timer) }

// spawn flies
function spawn() {
    arena.innerHTML = ""
    var lo = 3 + Math.floor(rnd * 0.3)
    var hi = 6 + Math.floor(rnd * 0.8)
    if (hi > 25) hi = 25
    if (lo > hi - 1) lo = hi - 1
    if (lo < 3) lo = 3
    numFlies = ri(lo, hi)

    var rect = arena.getBoundingClientRect()

    for (var i = 0; i < numFlies; i++) {
        var sz = ri(55, 140)
        var el = document.createElement("div")
        el.className = "fly"
        el.style.width = sz + "px"
        el.style.height = sz + "px"
        el.style.left = ri(10, rect.width - sz - 10) + "px"
        el.style.top = ri(10, rect.height - sz - 10) + "px"
        el.style.transform = "rotate(" + ri(-180, 180) + "deg)"
        el.style.zIndex = ri(1, 10)
        if (Math.random() > 0.5) el.style.transform += " scaleX(-1)"

        var img = document.createElement("img")
        img.src = flyImgs[ri(0, flyImgs.length - 1)]
        img.draggable = false
        el.appendChild(img)
        arena.appendChild(el)
    }
}

// game
function play() {
    rnd = 0
    streak = 0
    lives = LIVES
    showGame()
    next()
}

function next() {
    rnd++
    msgEl.classList.add("off")
    deadEl.classList.add("off")
    inp.value = ""
    updateHud()
    requestAnimationFrame(function() {
        spawn()
        startTimer()
        inp.focus()
    })
}

function go() {
    var v = inp.value.trim()
    if (!v) return
    stopTimer()
    var n = parseInt(v)
    if (n === numFlies) correct()
    else wrong(n)
}

function correct() {
    streak++
    if (streak > best) { best = streak; saveBest() }
    updateHud()
    popup("🖕", "good job", numFlies + " flies", "ok")
}

function wrong(n) {
    lives--
    streak = 0
    updateHud()
    if (lives <= 0) return die("there were " + numFlies + " — you said " + n)
    popup("❌", "nope", "there were " + numFlies + " (you said " + n + ") — " + lives + " lives left", "nope")
}

function timeout() {
    lives--
    streak = 0
    updateHud()
    if (lives <= 0) return die(" there were " + numFlies)
    popup("too slow", numFlies + " flies — " + lives + " left", "nope")
}

function popup(icon, head, sub, cls) {
    msgIcon.textContent = icon
    msgText.textContent = head
    msgText.className = cls
    msgSub.textContent = sub
    msgEl.classList.remove("off")
}

function die(info) {
    deadInfo.textContent = info
    dStr.textContent = streak
    dBest.textContent = best
    dRnd.textContent = rnd
    deadEl.classList.remove("off")
}

// events
document.getElementById("btn-play").onclick = play
document.getElementById("btn-go").onclick = go
document.getElementById("btn-next").onclick = next
document.getElementById("btn-retry").onclick = function() {
    deadEl.classList.add("off")
    play()
}
inp.onkeydown = function(e) {
    if (e.key === "Enter") { e.preventDefault(); go() }
}

// mode toggle
var btnTimed = document.getElementById("btn-timed")
var btnChill = document.getElementById("btn-chill")
btnTimed.onclick = function() {
    chill = false
    btnTimed.classList.add("sel")
    btnChill.classList.remove("sel")
}
btnChill.onclick = function() {
    chill = true
    btnChill.classList.add("sel")
    btnTimed.classList.remove("sel")
}

showMenu()
