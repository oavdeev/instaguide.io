export function formatFix(x, d) {
    let rounded = Math.round(parseFloat(x) * Math.pow(10, d));
    if (d >= 0) {
      let frac = rounded % Math.pow(10, d)
      let int = parseInt(rounded / Math.pow(10, d))
      let frac_str = frac.toString()
      if (frac_str.length < d)
          frac_str = "0".repeat(d - frac_str.length) + frac_str;
      if (frac_str.length > d)
          frac_str = frac_str.substr(0, d);

      return int + (frac_str.length?".":"")  + frac_str
    } else {
      return rounded.toString() + "0".repeat(-d);
    }
}

function roundDec(x, d) {
    return Math.round(x * Math.pow(10, -Math.floor(Math.log10(x)) + d - 1))  / Math.pow(10, -Math.floor(Math.log10(x)) + d - 1)
}

function formatRoundedMoney(x) {
    if (x < 10) {
      return formatFix(x, 2)
    } else if (x < 200) {
      return formatFix(x, 0)
    } else if (x < 1000) {
      return formatFix(x, -1)
    } else if (x < 10000) {
      return formatFix(x/1000, 1) + "K"
    } else if (x < 100000) {
      return formatFix(x/1000, 0) + "K"
    } else if (x < 1000000) {
      return formatFix(x/1000, -1) + "K"
    } else
      return formatFix(x/1000000, 1) + "M"
}

export function parsePeriod(x) {
  if (x == "hr")
    return 1;
  else if (x == "mo")
    return 30 * 24;
  else if (x == "yr")
    return 365 * 24;
  else if (x == "dy")
    return 24;
}

export function formatSpotDiscount(x) {
  if (x.length) {
    if (x[1] - x[0] > 5) {
      return (formatFix(x[0], 0) + ".." + formatFix(x[1], 0) + "%")
    } else {
      return (formatFix((x[0] + x[1]) / 2, 0) + "%")
    }
  } else return "N/A"
}

export function formatSpotAbs(x, period) {
  if (x.length) {
    if (Math.abs(x[1] / x[0]) > 1.15) {
      return (formatRoundedMoney(x[0]) + ".." + formatRoundedMoney(x[1]))
    } else {
      return (formatRoundedMoney((x[0] + x[1]) / 2))
    }
  } else return "N/A"
}

export function leftpad(x, n, c) {
  if (x.length < n)
    return c.repeat(n - x.length) + x
  else
    return x
}

export function fmtAbsPrice(perHr, period) {
  if (perHr === undefined || isNaN(perHr))
    return "N/A"
  const result = formatFix(parseFloat(perHr) * parsePeriod(period), period == "hr" ? 4 : 2)
  return result
}

export function getUrlParams() {
    let search = window.location.search;
    let hashes = search.slice(search.indexOf('?') + 1).split('&')
    let params = {}
    hashes.map(hash => {
        let [key, val] = hash.split('=')
        params[key] = decodeURIComponent(val)
    })

    return params
}
