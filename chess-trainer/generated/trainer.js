var ds = Object.defineProperty;
var ps = (n, t, e) => t in n ? ds(n, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : n[t] = e;
var T = (n, t, e) => ps(n, typeof t != "symbol" ? t + "" : t, e);
function gs(n) {
  return n !== null ? { comment: n, variations: [] } : { variations: [] };
}
function ms(n, t, e, s, i) {
  const r = { move: n, variations: i };
  return t && (r.suffix = t), e && (r.nag = e), s !== null && (r.comment = s), r;
}
function vs(...n) {
  const [t, ...e] = n;
  let s = t;
  for (const i of e)
    i !== null && (s.variations = [i, ...i.variations], i.variations = [], s = i);
  return t;
}
function _s(n, t) {
  if (t.marker && t.marker.comment) {
    let e = t.root;
    for (; ; ) {
      const s = e.variations[0];
      if (!s) {
        e.comment = t.marker.comment;
        break;
      }
      e = s;
    }
  }
  return {
    headers: n,
    root: t.root,
    result: (t.marker && t.marker.result) ?? void 0
  };
}
function bs(n, t) {
  function e() {
    this.constructor = n;
  }
  e.prototype = t.prototype, n.prototype = new e();
}
function _e(n, t, e, s) {
  var i = Error.call(this, n);
  return Object.setPrototypeOf && Object.setPrototypeOf(i, _e.prototype), i.expected = t, i.found = e, i.location = s, i.name = "SyntaxError", i;
}
bs(_e, Error);
function et(n, t, e) {
  return e = e || " ", n.length > t ? n : (t -= n.length, e += e.repeat(t), n + e.slice(0, t));
}
_e.prototype.format = function(n) {
  var t = "Error: " + this.message;
  if (this.location) {
    var e = null, s;
    for (s = 0; s < n.length; s++)
      if (n[s].source === this.location.source) {
        e = n[s].text.split(/\r\n|\n|\r/g);
        break;
      }
    var i = this.location.start, r = this.location.source && typeof this.location.source.offset == "function" ? this.location.source.offset(i) : i, o = this.location.source + ":" + r.line + ":" + r.column;
    if (e) {
      var a = this.location.end, u = et("", r.line.toString().length, " "), p = e[i.line - 1], g = i.line === a.line ? a.column : p.length + 1, b = g - i.column || 1;
      t += `
 --> ` + o + `
` + u + ` |
` + r.line + " | " + p + `
` + u + " | " + et("", i.column - 1, " ") + et("", b, "^");
    } else
      t += `
 at ` + o;
  }
  return t;
};
_e.buildMessage = function(n, t) {
  var e = {
    literal: function(p) {
      return '"' + i(p.text) + '"';
    },
    class: function(p) {
      var g = p.parts.map(function(b) {
        return Array.isArray(b) ? r(b[0]) + "-" + r(b[1]) : r(b);
      });
      return "[" + (p.inverted ? "^" : "") + g.join("") + "]";
    },
    any: function() {
      return "any character";
    },
    end: function() {
      return "end of input";
    },
    other: function(p) {
      return p.description;
    }
  };
  function s(p) {
    return p.charCodeAt(0).toString(16).toUpperCase();
  }
  function i(p) {
    return p.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(g) {
      return "\\x0" + s(g);
    }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(g) {
      return "\\x" + s(g);
    });
  }
  function r(p) {
    return p.replace(/\\/g, "\\\\").replace(/\]/g, "\\]").replace(/\^/g, "\\^").replace(/-/g, "\\-").replace(/\0/g, "\\0").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/[\x00-\x0F]/g, function(g) {
      return "\\x0" + s(g);
    }).replace(/[\x10-\x1F\x7F-\x9F]/g, function(g) {
      return "\\x" + s(g);
    });
  }
  function o(p) {
    return e[p.type](p);
  }
  function a(p) {
    var g = p.map(o), b, m;
    if (g.sort(), g.length > 0) {
      for (b = 1, m = 1; b < g.length; b++)
        g[b - 1] !== g[b] && (g[m] = g[b], m++);
      g.length = m;
    }
    switch (g.length) {
      case 1:
        return g[0];
      case 2:
        return g[0] + " or " + g[1];
      default:
        return g.slice(0, -1).join(", ") + ", or " + g[g.length - 1];
    }
  }
  function u(p) {
    return p ? '"' + i(p) + '"' : "end of input";
  }
  return "Expected " + a(n) + " but " + u(t) + " found.";
};
function Es(n, t) {
  t = t !== void 0 ? t : {};
  var e = {}, s = t.grammarSource, i = { pgn: Ut }, r = Ut, o = "[", a = '"', u = "]", p = ".", g = "O-O-O", b = "O-O", m = "0-0-0", N = "0-0", E = "$", x = "{", k = "}", D = ";", B = "(", ze = ")", kt = "1-0", Ct = "0-1", yt = "1/2-1/2", fn = "*", Ze = /^[a-zA-Z]/, $t = /^[^"]/, Le = /^[0-9]/, wt = /^[.]/, St = /^[a-zA-Z1-8\-=]/, dn = /^[+#]/, xt = /^[!?]/, At = /^[^}]/, Nt = /^[^\r\n]/, Lt = /^[ \t\r\n]/, pn = W("tag pair"), gn = q("[", !1), Mt = q('"', !1), mn = q("]", !1), vn = W("tag name"), Xe = z([["a", "z"], ["A", "Z"]], !1, !1), _n = W("tag value"), Tt = z(['"'], !0, !1), bn = W("move number"), Me = z([["0", "9"]], !1, !1), En = q(".", !1), Pt = z(["."], !1, !1), kn = W("standard algebraic notation"), Cn = q("O-O-O", !1), yn = q("O-O", !1), $n = q("0-0-0", !1), wn = q("0-0", !1), Ot = z([["a", "z"], ["A", "Z"], ["1", "8"], "-", "="], !1, !1), Sn = z(["+", "#"], !1, !1), xn = W("suffix annotation"), It = z(["!", "?"], !1, !1), An = W("NAG"), Nn = q("$", !1), Ln = W("brace comment"), Mn = q("{", !1), Rt = z(["}"], !0, !1), Tn = q("}", !1), Pn = W("rest of line comment"), On = q(";", !1), qt = z(["\r", `
`], !0, !1), In = W("variation"), Rn = q("(", !1), qn = q(")", !1), Kn = W("game termination marker"), Dn = q("1-0", !1), Fn = q("0-1", !1), Un = q("1/2-1/2", !1), Bn = q("*", !1), Qn = W("whitespace"), Kt = z([" ", "	", "\r", `
`], !1, !1), Gn = function(l, f) {
    return _s(l, f);
  }, jn = function(l) {
    return Object.fromEntries(l);
  }, Wn = function(l, f) {
    return [l, f];
  }, Hn = function(l, f) {
    return { root: l, marker: f };
  }, Vn = function(l, f) {
    return vs(gs(l), ...f.flat());
  }, Yn = function(l, f, d, y, $) {
    return ms(l, f, d, y, $);
  }, zn = function(l) {
    return l;
  }, Zn = function(l) {
    return l.replace(/[\r\n]+/g, " ");
  }, Xn = function(l) {
    return l.trim();
  }, Jn = function(l) {
    return l;
  }, es = function(l, f) {
    return { result: l, comment: f };
  }, h = t.peg$currPos | 0, fe = [{ line: 1, column: 1 }], Y = h, Te = t.peg$maxFailExpected || [], v = t.peg$silentFails | 0, Ce;
  if (t.startRule) {
    if (!(t.startRule in i))
      throw new Error(`Can't start parsing from rule "` + t.startRule + '".');
    r = i[t.startRule];
  }
  function q(l, f) {
    return { type: "literal", text: l, ignoreCase: f };
  }
  function z(l, f, d) {
    return { type: "class", parts: l, inverted: f, ignoreCase: d };
  }
  function ts() {
    return { type: "end" };
  }
  function W(l) {
    return { type: "other", description: l };
  }
  function Dt(l) {
    var f = fe[l], d;
    if (f)
      return f;
    if (l >= fe.length)
      d = fe.length - 1;
    else
      for (d = l; !fe[--d]; )
        ;
    for (f = fe[d], f = {
      line: f.line,
      column: f.column
    }; d < l; )
      n.charCodeAt(d) === 10 ? (f.line++, f.column = 1) : f.column++, d++;
    return fe[l] = f, f;
  }
  function Ft(l, f, d) {
    var y = Dt(l), $ = Dt(f), M = {
      source: s,
      start: {
        offset: l,
        line: y.line,
        column: y.column
      },
      end: {
        offset: f,
        line: $.line,
        column: $.column
      }
    };
    return M;
  }
  function C(l) {
    h < Y || (h > Y && (Y = h, Te = []), Te.push(l));
  }
  function ns(l, f, d) {
    return new _e(
      _e.buildMessage(l, f),
      l,
      f,
      d
    );
  }
  function Ut() {
    var l, f, d;
    return l = h, f = ss(), d = os(), l = Gn(f, d), l;
  }
  function ss() {
    var l, f, d;
    for (l = h, f = [], d = Bt(); d !== e; )
      f.push(d), d = Bt();
    return d = Q(), l = jn(f), l;
  }
  function Bt() {
    var l, f, d, y, $, M, oe;
    return v++, l = h, Q(), n.charCodeAt(h) === 91 ? (f = o, h++) : (f = e, v === 0 && C(gn)), f !== e ? (Q(), d = is(), d !== e ? (Q(), n.charCodeAt(h) === 34 ? (y = a, h++) : (y = e, v === 0 && C(Mt)), y !== e ? ($ = rs(), n.charCodeAt(h) === 34 ? (M = a, h++) : (M = e, v === 0 && C(Mt)), M !== e ? (Q(), n.charCodeAt(h) === 93 ? (oe = u, h++) : (oe = e, v === 0 && C(mn)), oe !== e ? l = Wn(d, $) : (h = l, l = e)) : (h = l, l = e)) : (h = l, l = e)) : (h = l, l = e)) : (h = l, l = e), v--, l === e && v === 0 && C(pn), l;
  }
  function is() {
    var l, f, d;
    if (v++, l = h, f = [], d = n.charAt(h), Ze.test(d) ? h++ : (d = e, v === 0 && C(Xe)), d !== e)
      for (; d !== e; )
        f.push(d), d = n.charAt(h), Ze.test(d) ? h++ : (d = e, v === 0 && C(Xe));
    else
      f = e;
    return f !== e ? l = n.substring(l, h) : l = f, v--, l === e && (f = e, v === 0 && C(vn)), l;
  }
  function rs() {
    var l, f, d;
    for (v++, l = h, f = [], d = n.charAt(h), $t.test(d) ? h++ : (d = e, v === 0 && C(Tt)); d !== e; )
      f.push(d), d = n.charAt(h), $t.test(d) ? h++ : (d = e, v === 0 && C(Tt));
    return l = n.substring(l, h), v--, f = e, v === 0 && C(_n), l;
  }
  function os() {
    var l, f, d;
    return l = h, f = Qt(), Q(), d = fs(), d === e && (d = null), Q(), l = Hn(f, d), l;
  }
  function Qt() {
    var l, f, d, y;
    for (l = h, f = Je(), f === e && (f = null), d = [], y = Gt(); y !== e; )
      d.push(y), y = Gt();
    return l = Vn(f, d), l;
  }
  function Gt() {
    var l, f, d, y, $, M, oe, Pe;
    if (l = h, Q(), as(), Q(), f = ls(), f !== e) {
      for (d = cs(), d === e && (d = null), y = [], $ = jt(); $ !== e; )
        y.push($), $ = jt();
      for ($ = Q(), M = Je(), M === e && (M = null), oe = [], Pe = Wt(); Pe !== e; )
        oe.push(Pe), Pe = Wt();
      l = Yn(f, d, y, M, oe);
    } else
      h = l, l = e;
    return l;
  }
  function as() {
    var l, f, d, y, $, M;
    for (v++, l = h, f = [], d = n.charAt(h), Le.test(d) ? h++ : (d = e, v === 0 && C(Me)); d !== e; )
      f.push(d), d = n.charAt(h), Le.test(d) ? h++ : (d = e, v === 0 && C(Me));
    if (n.charCodeAt(h) === 46 ? (d = p, h++) : (d = e, v === 0 && C(En)), d !== e) {
      for (y = Q(), $ = [], M = n.charAt(h), wt.test(M) ? h++ : (M = e, v === 0 && C(Pt)); M !== e; )
        $.push(M), M = n.charAt(h), wt.test(M) ? h++ : (M = e, v === 0 && C(Pt));
      f = [f, d, y, $], l = f;
    } else
      h = l, l = e;
    return v--, l === e && (f = e, v === 0 && C(bn)), l;
  }
  function ls() {
    var l, f, d, y, $, M;
    if (v++, l = h, f = h, n.substr(h, 5) === g ? (d = g, h += 5) : (d = e, v === 0 && C(Cn)), d === e && (n.substr(h, 3) === b ? (d = b, h += 3) : (d = e, v === 0 && C(yn)), d === e && (n.substr(h, 5) === m ? (d = m, h += 5) : (d = e, v === 0 && C($n)), d === e && (n.substr(h, 3) === N ? (d = N, h += 3) : (d = e, v === 0 && C(wn)), d === e))))
      if (d = h, y = n.charAt(h), Ze.test(y) ? h++ : (y = e, v === 0 && C(Xe)), y !== e) {
        if ($ = [], M = n.charAt(h), St.test(M) ? h++ : (M = e, v === 0 && C(Ot)), M !== e)
          for (; M !== e; )
            $.push(M), M = n.charAt(h), St.test(M) ? h++ : (M = e, v === 0 && C(Ot));
        else
          $ = e;
        $ !== e ? (y = [y, $], d = y) : (h = d, d = e);
      } else
        h = d, d = e;
    return d !== e ? (y = n.charAt(h), dn.test(y) ? h++ : (y = e, v === 0 && C(Sn)), y === e && (y = null), d = [d, y], f = d) : (h = f, f = e), f !== e ? l = n.substring(l, h) : l = f, v--, l === e && (f = e, v === 0 && C(kn)), l;
  }
  function cs() {
    var l, f, d;
    for (v++, l = h, f = [], d = n.charAt(h), xt.test(d) ? h++ : (d = e, v === 0 && C(It)); d !== e; )
      f.push(d), f.length >= 2 ? d = e : (d = n.charAt(h), xt.test(d) ? h++ : (d = e, v === 0 && C(It)));
    return f.length < 1 ? (h = l, l = e) : l = f, v--, l === e && (f = e, v === 0 && C(xn)), l;
  }
  function jt() {
    var l, f, d, y, $;
    if (v++, l = h, Q(), n.charCodeAt(h) === 36 ? (f = E, h++) : (f = e, v === 0 && C(Nn)), f !== e) {
      if (d = h, y = [], $ = n.charAt(h), Le.test($) ? h++ : ($ = e, v === 0 && C(Me)), $ !== e)
        for (; $ !== e; )
          y.push($), $ = n.charAt(h), Le.test($) ? h++ : ($ = e, v === 0 && C(Me));
      else
        y = e;
      y !== e ? d = n.substring(d, h) : d = y, d !== e ? l = zn(d) : (h = l, l = e);
    } else
      h = l, l = e;
    return v--, l === e && v === 0 && C(An), l;
  }
  function Je() {
    var l;
    return l = hs(), l === e && (l = us()), l;
  }
  function hs() {
    var l, f, d, y, $;
    if (v++, l = h, n.charCodeAt(h) === 123 ? (f = x, h++) : (f = e, v === 0 && C(Mn)), f !== e) {
      for (d = h, y = [], $ = n.charAt(h), At.test($) ? h++ : ($ = e, v === 0 && C(Rt)); $ !== e; )
        y.push($), $ = n.charAt(h), At.test($) ? h++ : ($ = e, v === 0 && C(Rt));
      d = n.substring(d, h), n.charCodeAt(h) === 125 ? (y = k, h++) : (y = e, v === 0 && C(Tn)), y !== e ? l = Zn(d) : (h = l, l = e);
    } else
      h = l, l = e;
    return v--, l === e && (f = e, v === 0 && C(Ln)), l;
  }
  function us() {
    var l, f, d, y, $;
    if (v++, l = h, n.charCodeAt(h) === 59 ? (f = D, h++) : (f = e, v === 0 && C(On)), f !== e) {
      for (d = h, y = [], $ = n.charAt(h), Nt.test($) ? h++ : ($ = e, v === 0 && C(qt)); $ !== e; )
        y.push($), $ = n.charAt(h), Nt.test($) ? h++ : ($ = e, v === 0 && C(qt));
      d = n.substring(d, h), l = Xn(d);
    } else
      h = l, l = e;
    return v--, l === e && (f = e, v === 0 && C(Pn)), l;
  }
  function Wt() {
    var l, f, d, y;
    return v++, l = h, Q(), n.charCodeAt(h) === 40 ? (f = B, h++) : (f = e, v === 0 && C(Rn)), f !== e ? (d = Qt(), d !== e ? (Q(), n.charCodeAt(h) === 41 ? (y = ze, h++) : (y = e, v === 0 && C(qn)), y !== e ? l = Jn(d) : (h = l, l = e)) : (h = l, l = e)) : (h = l, l = e), v--, l === e && v === 0 && C(In), l;
  }
  function fs() {
    var l, f, d;
    return v++, l = h, n.substr(h, 3) === kt ? (f = kt, h += 3) : (f = e, v === 0 && C(Dn)), f === e && (n.substr(h, 3) === Ct ? (f = Ct, h += 3) : (f = e, v === 0 && C(Fn)), f === e && (n.substr(h, 7) === yt ? (f = yt, h += 7) : (f = e, v === 0 && C(Un)), f === e && (n.charCodeAt(h) === 42 ? (f = fn, h++) : (f = e, v === 0 && C(Bn))))), f !== e ? (Q(), d = Je(), d === e && (d = null), l = es(f, d)) : (h = l, l = e), v--, l === e && (f = e, v === 0 && C(Kn)), l;
  }
  function Q() {
    var l, f;
    for (v++, l = [], f = n.charAt(h), Lt.test(f) ? h++ : (f = e, v === 0 && C(Kt)); f !== e; )
      l.push(f), f = n.charAt(h), Lt.test(f) ? h++ : (f = e, v === 0 && C(Kt));
    return v--, f = e, v === 0 && C(Qn), l;
  }
  if (Ce = r(), t.peg$library)
    return (
      /** @type {any} */
      {
        peg$result: Ce,
        peg$currPos: h,
        peg$FAILED: e,
        peg$maxFailExpected: Te,
        peg$maxFailPos: Y
      }
    );
  if (Ce !== e && h === n.length)
    return Ce;
  throw Ce !== e && h < n.length && C(ts()), ns(
    Te,
    Y < n.length ? n.charAt(Y) : null,
    Y < n.length ? Ft(Y, Y + 1) : Ft(Y, Y)
  );
}
/**
 * @license
 * Copyright (c) 2025, Jeff Hlywa (jhlywa@gmail.com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */
const Re = 0xffffffffffffffffn;
function tt(n, t) {
  return (n << t | n >> 64n - t) & 0xffffffffffffffffn;
}
function Ht(n, t) {
  return n * t & Re;
}
function ks(n) {
  return function() {
    let t = BigInt(n & Re), e = BigInt(n >> 64n & Re);
    const s = Ht(tt(Ht(t, 5n), 7n), 9n);
    return e ^= t, t = (tt(t, 24n) ^ e ^ e << 16n) & Re, e = tt(e, 37n), n = e << 64n | t, s;
  };
}
const He = ks(0xa187eb39cdcaed8f31c4b365b102e01en), Cs = Array.from({ length: 2 }, () => Array.from({ length: 6 }, () => Array.from({ length: 128 }, () => He()))), ys = Array.from({ length: 8 }, () => He()), $s = Array.from({ length: 16 }, () => He()), nt = He(), U = "w", j = "b", I = "p", ut = "n", qe = "b", we = "r", ie = "q", R = "k", st = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
class Oe {
  constructor(t, e) {
    T(this, "color");
    T(this, "from");
    T(this, "to");
    T(this, "piece");
    T(this, "captured");
    T(this, "promotion");
    /**
     * @deprecated This field is deprecated and will be removed in version 2.0.0.
     * Please use move descriptor functions instead: `isCapture`, `isPromotion`,
     * `isEnPassant`, `isKingsideCastle`, `isQueensideCastle`, `isCastle`, and
     * `isBigPawn`
     */
    T(this, "flags");
    T(this, "san");
    T(this, "lan");
    T(this, "before");
    T(this, "after");
    const { color: s, piece: i, from: r, to: o, flags: a, captured: u, promotion: p } = e, g = K(r), b = K(o);
    this.color = s, this.piece = i, this.from = g, this.to = b, this.san = t._moveToSan(e, t._moves({ legal: !0 })), this.lan = g + b, this.before = t.fen(), t._makeMove(e), this.after = t.fen(), t._undoMove(), this.flags = "";
    for (const m in S)
      S[m] & a && (this.flags += ae[m]);
    u && (this.captured = u), p && (this.promotion = p, this.lan += p);
  }
  isCapture() {
    return this.flags.indexOf(ae.CAPTURE) > -1;
  }
  isPromotion() {
    return this.flags.indexOf(ae.PROMOTION) > -1;
  }
  isEnPassant() {
    return this.flags.indexOf(ae.EP_CAPTURE) > -1;
  }
  isKingsideCastle() {
    return this.flags.indexOf(ae.KSIDE_CASTLE) > -1;
  }
  isQueensideCastle() {
    return this.flags.indexOf(ae.QSIDE_CASTLE) > -1;
  }
  isBigPawn() {
    return this.flags.indexOf(ae.BIG_PAWN) > -1;
  }
}
const F = -1, ae = {
  NORMAL: "n",
  CAPTURE: "c",
  BIG_PAWN: "b",
  EP_CAPTURE: "e",
  PROMOTION: "p",
  KSIDE_CASTLE: "k",
  QSIDE_CASTLE: "q",
  NULL_MOVE: "-"
}, S = {
  NORMAL: 1,
  CAPTURE: 2,
  BIG_PAWN: 4,
  EP_CAPTURE: 8,
  PROMOTION: 16,
  KSIDE_CASTLE: 32,
  QSIDE_CASTLE: 64,
  NULL_MOVE: 128
}, ft = {
  Event: "?",
  Site: "?",
  Date: "????.??.??",
  Round: "?",
  White: "?",
  Black: "?",
  Result: "*"
}, ws = {
  WhiteTitle: null,
  BlackTitle: null,
  WhiteElo: null,
  BlackElo: null,
  WhiteUSCF: null,
  BlackUSCF: null,
  WhiteNA: null,
  BlackNA: null,
  WhiteType: null,
  BlackType: null,
  EventDate: null,
  EventSponsor: null,
  Section: null,
  Stage: null,
  Board: null,
  Opening: null,
  Variation: null,
  SubVariation: null,
  ECO: null,
  NIC: null,
  Time: null,
  UTCTime: null,
  UTCDate: null,
  TimeControl: null,
  SetUp: null,
  FEN: null,
  Termination: null,
  Annotator: null,
  Mode: null,
  PlyCount: null
}, Ss = {
  ...ft,
  ...ws
}, w = {
  a8: 0,
  b8: 1,
  c8: 2,
  d8: 3,
  e8: 4,
  f8: 5,
  g8: 6,
  h8: 7,
  a7: 16,
  b7: 17,
  c7: 18,
  d7: 19,
  e7: 20,
  f7: 21,
  g7: 22,
  h7: 23,
  a6: 32,
  b6: 33,
  c6: 34,
  d6: 35,
  e6: 36,
  f6: 37,
  g6: 38,
  h6: 39,
  a5: 48,
  b5: 49,
  c5: 50,
  d5: 51,
  e5: 52,
  f5: 53,
  g5: 54,
  h5: 55,
  a4: 64,
  b4: 65,
  c4: 66,
  d4: 67,
  e4: 68,
  f4: 69,
  g4: 70,
  h4: 71,
  a3: 80,
  b3: 81,
  c3: 82,
  d3: 83,
  e3: 84,
  f3: 85,
  g3: 86,
  h3: 87,
  a2: 96,
  b2: 97,
  c2: 98,
  d2: 99,
  e2: 100,
  f2: 101,
  g2: 102,
  h2: 103,
  a1: 112,
  b1: 113,
  c1: 114,
  d1: 115,
  e1: 116,
  f1: 117,
  g1: 118,
  h1: 119
}, it = {
  b: [16, 32, 17, 15],
  w: [-16, -32, -17, -15]
}, Vt = {
  n: [-18, -33, -31, -14, 18, 33, 31, 14],
  b: [-17, -15, 17, 15],
  r: [-16, 1, 16, -1],
  q: [-17, -16, -15, 1, 17, 16, 15, -1],
  k: [-17, -16, -15, 1, 17, 16, 15, -1]
}, xs = [
  20,
  0,
  0,
  0,
  0,
  0,
  0,
  24,
  0,
  0,
  0,
  0,
  0,
  0,
  20,
  0,
  0,
  20,
  0,
  0,
  0,
  0,
  0,
  24,
  0,
  0,
  0,
  0,
  0,
  20,
  0,
  0,
  0,
  0,
  20,
  0,
  0,
  0,
  0,
  24,
  0,
  0,
  0,
  0,
  20,
  0,
  0,
  0,
  0,
  0,
  0,
  20,
  0,
  0,
  0,
  24,
  0,
  0,
  0,
  20,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  20,
  0,
  0,
  24,
  0,
  0,
  20,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  20,
  2,
  24,
  2,
  20,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  2,
  53,
  56,
  53,
  2,
  0,
  0,
  0,
  0,
  0,
  0,
  24,
  24,
  24,
  24,
  24,
  24,
  56,
  0,
  56,
  24,
  24,
  24,
  24,
  24,
  24,
  0,
  0,
  0,
  0,
  0,
  0,
  2,
  53,
  56,
  53,
  2,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  20,
  2,
  24,
  2,
  20,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  20,
  0,
  0,
  24,
  0,
  0,
  20,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  20,
  0,
  0,
  0,
  24,
  0,
  0,
  0,
  20,
  0,
  0,
  0,
  0,
  0,
  0,
  20,
  0,
  0,
  0,
  0,
  24,
  0,
  0,
  0,
  0,
  20,
  0,
  0,
  0,
  0,
  20,
  0,
  0,
  0,
  0,
  0,
  24,
  0,
  0,
  0,
  0,
  0,
  20,
  0,
  0,
  20,
  0,
  0,
  0,
  0,
  0,
  0,
  24,
  0,
  0,
  0,
  0,
  0,
  0,
  20
], As = [
  17,
  0,
  0,
  0,
  0,
  0,
  0,
  16,
  0,
  0,
  0,
  0,
  0,
  0,
  15,
  0,
  0,
  17,
  0,
  0,
  0,
  0,
  0,
  16,
  0,
  0,
  0,
  0,
  0,
  15,
  0,
  0,
  0,
  0,
  17,
  0,
  0,
  0,
  0,
  16,
  0,
  0,
  0,
  0,
  15,
  0,
  0,
  0,
  0,
  0,
  0,
  17,
  0,
  0,
  0,
  16,
  0,
  0,
  0,
  15,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  17,
  0,
  0,
  16,
  0,
  0,
  15,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  17,
  0,
  16,
  0,
  15,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  17,
  16,
  15,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  -1,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  -15,
  -16,
  -17,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  -15,
  0,
  -16,
  0,
  -17,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  -15,
  0,
  0,
  -16,
  0,
  0,
  -17,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  -15,
  0,
  0,
  0,
  -16,
  0,
  0,
  0,
  -17,
  0,
  0,
  0,
  0,
  0,
  0,
  -15,
  0,
  0,
  0,
  0,
  -16,
  0,
  0,
  0,
  0,
  -17,
  0,
  0,
  0,
  0,
  -15,
  0,
  0,
  0,
  0,
  0,
  -16,
  0,
  0,
  0,
  0,
  0,
  -17,
  0,
  0,
  -15,
  0,
  0,
  0,
  0,
  0,
  0,
  -16,
  0,
  0,
  0,
  0,
  0,
  0,
  -17
], Ns = { p: 1, n: 2, b: 4, r: 8, q: 16, k: 32 }, Ls = "pnbrqkPNBRQK", Yt = [ut, qe, we, ie], Ms = 7, Ts = 6, Ps = 1, Os = 0, Ie = {
  [R]: S.KSIDE_CASTLE,
  [ie]: S.QSIDE_CASTLE
}, ne = {
  w: [
    { square: w.a1, flag: S.QSIDE_CASTLE },
    { square: w.h1, flag: S.KSIDE_CASTLE }
  ],
  b: [
    { square: w.a8, flag: S.QSIDE_CASTLE },
    { square: w.h8, flag: S.KSIDE_CASTLE }
  ]
}, Is = { b: Ps, w: Ts }, rt = "--";
function le(n) {
  return n >> 4;
}
function Se(n) {
  return n & 15;
}
function tn(n) {
  return "0123456789".indexOf(n) !== -1;
}
function K(n) {
  const t = Se(n), e = le(n);
  return "abcdefgh".substring(t, t + 1) + "87654321".substring(e, e + 1);
}
function ye(n) {
  return n === U ? j : U;
}
function Rs(n) {
  const t = n.split(/\s+/);
  if (t.length !== 6)
    return {
      ok: !1,
      error: "Invalid FEN: must contain six space-delimited fields"
    };
  const e = parseInt(t[5], 10);
  if (isNaN(e) || e <= 0)
    return {
      ok: !1,
      error: "Invalid FEN: move number must be a positive integer"
    };
  const s = parseInt(t[4], 10);
  if (isNaN(s) || s < 0)
    return {
      ok: !1,
      error: "Invalid FEN: half move counter number must be a non-negative integer"
    };
  if (!/^(-|[abcdefgh][36])$/.test(t[3]))
    return { ok: !1, error: "Invalid FEN: en-passant square is invalid" };
  if (/[^kKqQ-]/.test(t[2]))
    return { ok: !1, error: "Invalid FEN: castling availability is invalid" };
  if (!/^(w|b)$/.test(t[1]))
    return { ok: !1, error: "Invalid FEN: side-to-move is invalid" };
  const i = t[0].split("/");
  if (i.length !== 8)
    return {
      ok: !1,
      error: "Invalid FEN: piece data does not contain 8 '/'-delimited rows"
    };
  for (let o = 0; o < i.length; o++) {
    let a = 0, u = !1;
    for (let p = 0; p < i[o].length; p++)
      if (tn(i[o][p])) {
        if (u)
          return {
            ok: !1,
            error: "Invalid FEN: piece data is invalid (consecutive number)"
          };
        a += parseInt(i[o][p], 10), u = !0;
      } else {
        if (!/^[prnbqkPRNBQK]$/.test(i[o][p]))
          return {
            ok: !1,
            error: "Invalid FEN: piece data is invalid (invalid piece)"
          };
        a += 1, u = !1;
      }
    if (a !== 8)
      return {
        ok: !1,
        error: "Invalid FEN: piece data is invalid (too many squares in rank)"
      };
  }
  if (t[3][1] == "3" && t[1] == "w" || t[3][1] == "6" && t[1] == "b")
    return { ok: !1, error: "Invalid FEN: illegal en-passant square" };
  const r = [
    { color: "white", regex: /K/g },
    { color: "black", regex: /k/g }
  ];
  for (const { color: o, regex: a } of r) {
    if (!a.test(t[0]))
      return { ok: !1, error: `Invalid FEN: missing ${o} king` };
    if ((t[0].match(a) || []).length > 1)
      return { ok: !1, error: `Invalid FEN: too many ${o} kings` };
  }
  return Array.from(i[0] + i[7]).some((o) => o.toUpperCase() === "P") ? {
    ok: !1,
    error: "Invalid FEN: some pawns are on the edge rows"
  } : { ok: !0 };
}
function qs(n, t) {
  const e = n.from, s = n.to, i = n.piece;
  let r = 0, o = 0, a = 0;
  for (let u = 0, p = t.length; u < p; u++) {
    const g = t[u].from, b = t[u].to, m = t[u].piece;
    i === m && e !== g && s === b && (r++, le(e) === le(g) && o++, Se(e) === Se(g) && a++);
  }
  return r > 0 ? o > 0 && a > 0 ? K(e) : a > 0 ? K(e).charAt(1) : K(e).charAt(0) : "";
}
function se(n, t, e, s, i, r = void 0, o = S.NORMAL) {
  const a = le(s);
  if (i === I && (a === Ms || a === Os))
    for (let u = 0; u < Yt.length; u++) {
      const p = Yt[u];
      n.push({
        color: t,
        from: e,
        to: s,
        piece: i,
        captured: r,
        promotion: p,
        flags: o | S.PROMOTION
      });
    }
  else
    n.push({
      color: t,
      from: e,
      to: s,
      piece: i,
      captured: r,
      flags: o
    });
}
function zt(n) {
  let t = n.charAt(0);
  return t >= "a" && t <= "h" ? n.match(/[a-h]\d.*[a-h]\d/) ? void 0 : I : (t = t.toLowerCase(), t === "o" ? R : t);
}
function ot(n) {
  return n.replace(/=/, "").replace(/[+#]?[?!]*$/, "");
}
class xe {
  constructor(t = st, { skipValidation: e = !1 } = {}) {
    T(this, "_board", new Array(128));
    T(this, "_turn", U);
    T(this, "_header", {});
    T(this, "_kings", { w: F, b: F });
    T(this, "_epSquare", -1);
    T(this, "_halfMoves", 0);
    T(this, "_moveNumber", 0);
    T(this, "_history", []);
    T(this, "_comments", {});
    T(this, "_castling", { w: 0, b: 0 });
    T(this, "_hash", 0n);
    // tracks number of times a position has been seen for repetition checking
    T(this, "_positionCount", /* @__PURE__ */ new Map());
    this.load(t, { skipValidation: e });
  }
  clear({ preserveHeaders: t = !1 } = {}) {
    this._board = new Array(128), this._kings = { w: F, b: F }, this._turn = U, this._castling = { w: 0, b: 0 }, this._epSquare = F, this._halfMoves = 0, this._moveNumber = 1, this._history = [], this._comments = {}, this._header = t ? this._header : { ...Ss }, this._hash = this._computeHash(), this._positionCount = /* @__PURE__ */ new Map(), this._header.SetUp = null, this._header.FEN = null;
  }
  load(t, { skipValidation: e = !1, preserveHeaders: s = !1 } = {}) {
    let i = t.split(/\s+/);
    if (i.length >= 2 && i.length < 6) {
      const a = ["-", "-", "0", "1"];
      t = i.concat(a.slice(-(6 - i.length))).join(" ");
    }
    if (i = t.split(/\s+/), !e) {
      const { ok: a, error: u } = Rs(t);
      if (!a)
        throw new Error(u);
    }
    const r = i[0];
    let o = 0;
    this.clear({ preserveHeaders: s });
    for (let a = 0; a < r.length; a++) {
      const u = r.charAt(a);
      if (u === "/")
        o += 8;
      else if (tn(u))
        o += parseInt(u, 10);
      else {
        const p = u < "a" ? U : j;
        this._put({ type: u.toLowerCase(), color: p }, K(o)), o++;
      }
    }
    this._turn = i[1], i[2].indexOf("K") > -1 && (this._castling.w |= S.KSIDE_CASTLE), i[2].indexOf("Q") > -1 && (this._castling.w |= S.QSIDE_CASTLE), i[2].indexOf("k") > -1 && (this._castling.b |= S.KSIDE_CASTLE), i[2].indexOf("q") > -1 && (this._castling.b |= S.QSIDE_CASTLE), this._epSquare = i[3] === "-" ? F : w[i[3]], this._halfMoves = parseInt(i[4], 10), this._moveNumber = parseInt(i[5], 10), this._hash = this._computeHash(), this._updateSetup(t), this._incPositionCount();
  }
  fen({ forceEnpassantSquare: t = !1 } = {}) {
    var o, a;
    let e = 0, s = "";
    for (let u = w.a8; u <= w.h1; u++) {
      if (this._board[u]) {
        e > 0 && (s += e, e = 0);
        const { color: p, type: g } = this._board[u];
        s += p === U ? g.toUpperCase() : g.toLowerCase();
      } else
        e++;
      u + 1 & 136 && (e > 0 && (s += e), u !== w.h1 && (s += "/"), e = 0, u += 8);
    }
    let i = "";
    this._castling[U] & S.KSIDE_CASTLE && (i += "K"), this._castling[U] & S.QSIDE_CASTLE && (i += "Q"), this._castling[j] & S.KSIDE_CASTLE && (i += "k"), this._castling[j] & S.QSIDE_CASTLE && (i += "q"), i = i || "-";
    let r = "-";
    if (this._epSquare !== F)
      if (t)
        r = K(this._epSquare);
      else {
        const u = this._epSquare + (this._turn === U ? 16 : -16), p = [u + 1, u - 1];
        for (const g of p) {
          if (g & 136)
            continue;
          const b = this._turn;
          if (((o = this._board[g]) == null ? void 0 : o.color) === b && ((a = this._board[g]) == null ? void 0 : a.type) === I) {
            this._makeMove({
              color: b,
              from: g,
              to: this._epSquare,
              piece: I,
              captured: I,
              flags: S.EP_CAPTURE
            });
            const m = !this._isKingAttacked(b);
            if (this._undoMove(), m) {
              r = K(this._epSquare);
              break;
            }
          }
        }
      }
    return [
      s,
      this._turn,
      i,
      r,
      this._halfMoves,
      this._moveNumber
    ].join(" ");
  }
  _pieceKey(t) {
    if (!this._board[t])
      return 0n;
    const { color: e, type: s } = this._board[t], i = {
      w: 0,
      b: 1
    }[e], r = {
      p: 0,
      n: 1,
      b: 2,
      r: 3,
      q: 4,
      k: 5
    }[s];
    return Cs[i][r][t];
  }
  _epKey() {
    return this._epSquare === F ? 0n : ys[this._epSquare & 7];
  }
  _castlingKey() {
    const t = this._castling.w >> 5 | this._castling.b >> 3;
    return $s[t];
  }
  _computeHash() {
    let t = 0n;
    for (let e = w.a8; e <= w.h1; e++) {
      if (e & 136) {
        e += 7;
        continue;
      }
      this._board[e] && (t ^= this._pieceKey(e));
    }
    return t ^= this._epKey(), t ^= this._castlingKey(), this._turn === "b" && (t ^= nt), t;
  }
  /*
   * Called when the initial board setup is changed with put() or remove().
   * modifies the SetUp and FEN properties of the header object. If the FEN
   * is equal to the default position, the SetUp and FEN are deleted the setup
   * is only updated if history.length is zero, ie moves haven't been made.
   */
  _updateSetup(t) {
    this._history.length > 0 || (t !== st ? (this._header.SetUp = "1", this._header.FEN = t) : (this._header.SetUp = null, this._header.FEN = null));
  }
  reset() {
    this.load(st);
  }
  get(t) {
    return this._board[w[t]];
  }
  findPiece(t) {
    var s;
    const e = [];
    for (let i = w.a8; i <= w.h1; i++) {
      if (i & 136) {
        i += 7;
        continue;
      }
      !this._board[i] || ((s = this._board[i]) == null ? void 0 : s.color) !== t.color || this._board[i].color === t.color && this._board[i].type === t.type && e.push(K(i));
    }
    return e;
  }
  put({ type: t, color: e }, s) {
    return this._put({ type: t, color: e }, s) ? (this._updateCastlingRights(), this._updateEnPassantSquare(), this._updateSetup(this.fen()), !0) : !1;
  }
  _set(t, e) {
    this._hash ^= this._pieceKey(t), this._board[t] = e, this._hash ^= this._pieceKey(t);
  }
  _put({ type: t, color: e }, s) {
    if (Ls.indexOf(t.toLowerCase()) === -1 || !(s in w))
      return !1;
    const i = w[s];
    if (t == R && !(this._kings[e] == F || this._kings[e] == i))
      return !1;
    const r = this._board[i];
    return r && r.type === R && (this._kings[r.color] = F), this._set(i, { type: t, color: e }), t === R && (this._kings[e] = i), !0;
  }
  _clear(t) {
    this._hash ^= this._pieceKey(t), delete this._board[t];
  }
  remove(t) {
    const e = this.get(t);
    return this._clear(w[t]), e && e.type === R && (this._kings[e.color] = F), this._updateCastlingRights(), this._updateEnPassantSquare(), this._updateSetup(this.fen()), e;
  }
  _updateCastlingRights() {
    var s, i, r, o, a, u, p, g, b, m, N, E;
    this._hash ^= this._castlingKey();
    const t = ((s = this._board[w.e1]) == null ? void 0 : s.type) === R && ((i = this._board[w.e1]) == null ? void 0 : i.color) === U, e = ((r = this._board[w.e8]) == null ? void 0 : r.type) === R && ((o = this._board[w.e8]) == null ? void 0 : o.color) === j;
    (!t || ((a = this._board[w.a1]) == null ? void 0 : a.type) !== we || ((u = this._board[w.a1]) == null ? void 0 : u.color) !== U) && (this._castling.w &= -65), (!t || ((p = this._board[w.h1]) == null ? void 0 : p.type) !== we || ((g = this._board[w.h1]) == null ? void 0 : g.color) !== U) && (this._castling.w &= -33), (!e || ((b = this._board[w.a8]) == null ? void 0 : b.type) !== we || ((m = this._board[w.a8]) == null ? void 0 : m.color) !== j) && (this._castling.b &= -65), (!e || ((N = this._board[w.h8]) == null ? void 0 : N.type) !== we || ((E = this._board[w.h8]) == null ? void 0 : E.color) !== j) && (this._castling.b &= -33), this._hash ^= this._castlingKey();
  }
  _updateEnPassantSquare() {
    var r, o;
    if (this._epSquare === F)
      return;
    const t = this._epSquare + (this._turn === U ? -16 : 16), e = this._epSquare + (this._turn === U ? 16 : -16), s = [e + 1, e - 1];
    if (this._board[t] !== null || this._board[this._epSquare] !== null || ((r = this._board[e]) == null ? void 0 : r.color) !== ye(this._turn) || ((o = this._board[e]) == null ? void 0 : o.type) !== I) {
      this._hash ^= this._epKey(), this._epSquare = F;
      return;
    }
    const i = (a) => {
      var u, p;
      return !(a & 136) && ((u = this._board[a]) == null ? void 0 : u.color) === this._turn && ((p = this._board[a]) == null ? void 0 : p.type) === I;
    };
    s.some(i) || (this._hash ^= this._epKey(), this._epSquare = F);
  }
  _attacked(t, e, s) {
    const i = [];
    for (let r = w.a8; r <= w.h1; r++) {
      if (r & 136) {
        r += 7;
        continue;
      }
      if (this._board[r] === void 0 || this._board[r].color !== t)
        continue;
      const o = this._board[r], a = r - e;
      if (a === 0)
        continue;
      const u = a + 119;
      if (xs[u] & Ns[o.type]) {
        if (o.type === I) {
          if (a > 0 && o.color === U || a <= 0 && o.color === j)
            if (s)
              i.push(K(r));
            else
              return !0;
          continue;
        }
        if (o.type === "n" || o.type === "k")
          if (s) {
            i.push(K(r));
            continue;
          } else
            return !0;
        const p = As[u];
        let g = r + p, b = !1;
        for (; g !== e; ) {
          if (this._board[g] != null) {
            b = !0;
            break;
          }
          g += p;
        }
        if (!b)
          if (s) {
            i.push(K(r));
            continue;
          } else
            return !0;
      }
    }
    return s ? i : !1;
  }
  attackers(t, e) {
    return e ? this._attacked(e, w[t], !0) : this._attacked(this._turn, w[t], !0);
  }
  _isKingAttacked(t) {
    const e = this._kings[t];
    return e === -1 ? !1 : this._attacked(ye(t), e);
  }
  hash() {
    return this._hash.toString(16);
  }
  isAttacked(t, e) {
    return this._attacked(e, w[t]);
  }
  isCheck() {
    return this._isKingAttacked(this._turn);
  }
  inCheck() {
    return this.isCheck();
  }
  isCheckmate() {
    return this.isCheck() && this._moves().length === 0;
  }
  isStalemate() {
    return !this.isCheck() && this._moves().length === 0;
  }
  isInsufficientMaterial() {
    const t = {
      b: 0,
      n: 0,
      r: 0,
      q: 0,
      k: 0,
      p: 0
    }, e = [];
    let s = 0, i = 0;
    for (let r = w.a8; r <= w.h1; r++) {
      if (i = (i + 1) % 2, r & 136) {
        r += 7;
        continue;
      }
      const o = this._board[r];
      o && (t[o.type] = o.type in t ? t[o.type] + 1 : 1, o.type === qe && e.push(i), s++);
    }
    if (s === 2)
      return !0;
    if (
      // k vs. kn .... or .... k vs. kb
      s === 3 && (t[qe] === 1 || t[ut] === 1)
    )
      return !0;
    if (s === t[qe] + 2) {
      let r = 0;
      const o = e.length;
      for (let a = 0; a < o; a++)
        r += e[a];
      if (r === 0 || r === o)
        return !0;
    }
    return !1;
  }
  isThreefoldRepetition() {
    return this._getPositionCount(this._hash) >= 3;
  }
  isDrawByFiftyMoves() {
    return this._halfMoves >= 100;
  }
  isDraw() {
    return this.isDrawByFiftyMoves() || this.isStalemate() || this.isInsufficientMaterial() || this.isThreefoldRepetition();
  }
  isGameOver() {
    return this.isCheckmate() || this.isDraw();
  }
  moves({ verbose: t = !1, square: e = void 0, piece: s = void 0 } = {}) {
    const i = this._moves({ square: e, piece: s });
    return t ? i.map((r) => new Oe(this, r)) : i.map((r) => this._moveToSan(r, i));
  }
  _moves({ legal: t = !0, piece: e = void 0, square: s = void 0 } = {}) {
    var N;
    const i = s ? s.toLowerCase() : void 0, r = e == null ? void 0 : e.toLowerCase(), o = [], a = this._turn, u = ye(a);
    let p = w.a8, g = w.h1, b = !1;
    if (i)
      if (i in w)
        p = g = w[i], b = !0;
      else
        return [];
    for (let E = p; E <= g; E++) {
      if (E & 136) {
        E += 7;
        continue;
      }
      if (!this._board[E] || this._board[E].color === u)
        continue;
      const { type: x } = this._board[E];
      let k;
      if (x === I) {
        if (r && r !== x)
          continue;
        k = E + it[a][0], this._board[k] || (se(o, a, E, k, I), k = E + it[a][1], Is[a] === le(E) && !this._board[k] && se(o, a, E, k, I, void 0, S.BIG_PAWN));
        for (let D = 2; D < 4; D++)
          k = E + it[a][D], !(k & 136) && (((N = this._board[k]) == null ? void 0 : N.color) === u ? se(o, a, E, k, I, this._board[k].type, S.CAPTURE) : k === this._epSquare && se(o, a, E, k, I, I, S.EP_CAPTURE));
      } else {
        if (r && r !== x)
          continue;
        for (let D = 0, B = Vt[x].length; D < B; D++) {
          const ze = Vt[x][D];
          for (k = E; k += ze, !(k & 136); ) {
            if (!this._board[k])
              se(o, a, E, k, x);
            else {
              if (this._board[k].color === a)
                break;
              se(o, a, E, k, x, this._board[k].type, S.CAPTURE);
              break;
            }
            if (x === ut || x === R)
              break;
          }
        }
      }
    }
    if ((r === void 0 || r === R) && (!b || g === this._kings[a])) {
      if (this._castling[a] & S.KSIDE_CASTLE) {
        const E = this._kings[a], x = E + 2;
        !this._board[E + 1] && !this._board[x] && !this._attacked(u, this._kings[a]) && !this._attacked(u, E + 1) && !this._attacked(u, x) && se(o, a, this._kings[a], x, R, void 0, S.KSIDE_CASTLE);
      }
      if (this._castling[a] & S.QSIDE_CASTLE) {
        const E = this._kings[a], x = E - 2;
        !this._board[E - 1] && !this._board[E - 2] && !this._board[E - 3] && !this._attacked(u, this._kings[a]) && !this._attacked(u, E - 1) && !this._attacked(u, x) && se(o, a, this._kings[a], x, R, void 0, S.QSIDE_CASTLE);
      }
    }
    if (!t || this._kings[a] === -1)
      return o;
    const m = [];
    for (let E = 0, x = o.length; E < x; E++)
      this._makeMove(o[E]), this._isKingAttacked(a) || m.push(o[E]), this._undoMove();
    return m;
  }
  move(t, { strict: e = !1 } = {}) {
    let s = null;
    if (typeof t == "string")
      s = this._moveFromSan(t, e);
    else if (t === null)
      s = this._moveFromSan(rt, e);
    else if (typeof t == "object") {
      const r = this._moves();
      for (let o = 0, a = r.length; o < a; o++)
        if (t.from === K(r[o].from) && t.to === K(r[o].to) && (!("promotion" in r[o]) || t.promotion === r[o].promotion)) {
          s = r[o];
          break;
        }
    }
    if (!s)
      throw typeof t == "string" ? new Error(`Invalid move: ${t}`) : new Error(`Invalid move: ${JSON.stringify(t)}`);
    if (this.isCheck() && s.flags & S.NULL_MOVE)
      throw new Error("Null move not allowed when in check");
    const i = new Oe(this, s);
    return this._makeMove(s), this._incPositionCount(), i;
  }
  _push(t) {
    this._history.push({
      move: t,
      kings: { b: this._kings.b, w: this._kings.w },
      turn: this._turn,
      castling: { b: this._castling.b, w: this._castling.w },
      epSquare: this._epSquare,
      halfMoves: this._halfMoves,
      moveNumber: this._moveNumber
    });
  }
  _movePiece(t, e) {
    this._hash ^= this._pieceKey(t), this._board[e] = this._board[t], delete this._board[t], this._hash ^= this._pieceKey(e);
  }
  _makeMove(t) {
    var i, r, o, a;
    const e = this._turn, s = ye(e);
    if (this._push(t), t.flags & S.NULL_MOVE) {
      e === j && this._moveNumber++, this._halfMoves++, this._turn = s, this._epSquare = F;
      return;
    }
    if (this._hash ^= this._epKey(), this._hash ^= this._castlingKey(), t.captured && (this._hash ^= this._pieceKey(t.to)), this._movePiece(t.from, t.to), t.flags & S.EP_CAPTURE && (this._turn === j ? this._clear(t.to - 16) : this._clear(t.to + 16)), t.promotion && (this._clear(t.to), this._set(t.to, { type: t.promotion, color: e })), this._board[t.to].type === R) {
      if (this._kings[e] = t.to, t.flags & S.KSIDE_CASTLE) {
        const u = t.to - 1, p = t.to + 1;
        this._movePiece(p, u);
      } else if (t.flags & S.QSIDE_CASTLE) {
        const u = t.to + 1, p = t.to - 2;
        this._movePiece(p, u);
      }
      this._castling[e] = 0;
    }
    if (this._castling[e]) {
      for (let u = 0, p = ne[e].length; u < p; u++)
        if (t.from === ne[e][u].square && this._castling[e] & ne[e][u].flag) {
          this._castling[e] ^= ne[e][u].flag;
          break;
        }
    }
    if (this._castling[s]) {
      for (let u = 0, p = ne[s].length; u < p; u++)
        if (t.to === ne[s][u].square && this._castling[s] & ne[s][u].flag) {
          this._castling[s] ^= ne[s][u].flag;
          break;
        }
    }
    if (this._hash ^= this._castlingKey(), t.flags & S.BIG_PAWN) {
      let u;
      e === j ? u = t.to - 16 : u = t.to + 16, !(t.to - 1 & 136) && ((i = this._board[t.to - 1]) == null ? void 0 : i.type) === I && ((r = this._board[t.to - 1]) == null ? void 0 : r.color) === s || !(t.to + 1 & 136) && ((o = this._board[t.to + 1]) == null ? void 0 : o.type) === I && ((a = this._board[t.to + 1]) == null ? void 0 : a.color) === s ? (this._epSquare = u, this._hash ^= this._epKey()) : this._epSquare = F;
    } else
      this._epSquare = F;
    t.piece === I ? this._halfMoves = 0 : t.flags & (S.CAPTURE | S.EP_CAPTURE) ? this._halfMoves = 0 : this._halfMoves++, e === j && this._moveNumber++, this._turn = s, this._hash ^= nt;
  }
  undo() {
    const t = this._hash, e = this._undoMove();
    if (e) {
      const s = new Oe(this, e);
      return this._decPositionCount(t), s;
    }
    return null;
  }
  _undoMove() {
    const t = this._history.pop();
    if (t === void 0)
      return null;
    this._hash ^= this._epKey(), this._hash ^= this._castlingKey();
    const e = t.move;
    this._kings = t.kings, this._turn = t.turn, this._castling = t.castling, this._epSquare = t.epSquare, this._halfMoves = t.halfMoves, this._moveNumber = t.moveNumber, this._hash ^= this._epKey(), this._hash ^= this._castlingKey(), this._hash ^= nt;
    const s = this._turn, i = ye(s);
    if (e.flags & S.NULL_MOVE)
      return e;
    if (this._movePiece(e.to, e.from), e.piece && (this._clear(e.from), this._set(e.from, { type: e.piece, color: s })), e.captured)
      if (e.flags & S.EP_CAPTURE) {
        let r;
        s === j ? r = e.to - 16 : r = e.to + 16, this._set(r, { type: I, color: i });
      } else
        this._set(e.to, { type: e.captured, color: i });
    if (e.flags & (S.KSIDE_CASTLE | S.QSIDE_CASTLE)) {
      let r, o;
      e.flags & S.KSIDE_CASTLE ? (r = e.to + 1, o = e.to - 1) : (r = e.to - 2, o = e.to + 1), this._movePiece(o, r);
    }
    return e;
  }
  pgn({ newline: t = `
`, maxWidth: e = 0 } = {}) {
    const s = [];
    let i = !1;
    for (const m in this._header)
      this._header[m] && s.push(`[${m} "${this._header[m]}"]` + t), i = !0;
    i && this._history.length && s.push(t);
    const r = (m) => {
      const N = this._comments[this.fen()];
      if (typeof N < "u") {
        const E = m.length > 0 ? " " : "";
        m = `${m}${E}{${N}}`;
      }
      return m;
    }, o = [];
    for (; this._history.length > 0; )
      o.push(this._undoMove());
    const a = [];
    let u = "";
    for (o.length === 0 && a.push(r("")); o.length > 0; ) {
      u = r(u);
      const m = o.pop();
      if (!m)
        break;
      if (!this._history.length && m.color === "b") {
        const N = `${this._moveNumber}. ...`;
        u = u ? `${u} ${N}` : N;
      } else m.color === "w" && (u.length && a.push(u), u = this._moveNumber + ".");
      u = u + " " + this._moveToSan(m, this._moves({ legal: !0 })), this._makeMove(m);
    }
    if (u.length && a.push(r(u)), a.push(this._header.Result || "*"), e === 0)
      return s.join("") + a.join(" ");
    const p = function() {
      return s.length > 0 && s[s.length - 1] === " " ? (s.pop(), !0) : !1;
    }, g = function(m, N) {
      for (const E of N.split(" "))
        if (E) {
          if (m + E.length > e) {
            for (; p(); )
              m--;
            s.push(t), m = 0;
          }
          s.push(E), m += E.length, s.push(" "), m++;
        }
      return p() && m--, m;
    };
    let b = 0;
    for (let m = 0; m < a.length; m++) {
      if (b + a[m].length > e && a[m].includes("{")) {
        b = g(b, a[m]);
        continue;
      }
      b + a[m].length > e && m !== 0 ? (s[s.length - 1] === " " && s.pop(), s.push(t), b = 0) : m !== 0 && (s.push(" "), b++), s.push(a[m]), b += a[m].length;
    }
    return s.join("");
  }
  /**
   * @deprecated Use `setHeader` and `getHeaders` instead. This method will return null header tags (which is not what you want)
   */
  header(...t) {
    for (let e = 0; e < t.length; e += 2)
      typeof t[e] == "string" && typeof t[e + 1] == "string" && (this._header[t[e]] = t[e + 1]);
    return this._header;
  }
  // TODO: value validation per spec
  setHeader(t, e) {
    return this._header[t] = e ?? ft[t] ?? null, this.getHeaders();
  }
  removeHeader(t) {
    return t in this._header ? (this._header[t] = ft[t] || null, !0) : !1;
  }
  // return only non-null headers (omit placemarker nulls)
  getHeaders() {
    const t = {};
    for (const [e, s] of Object.entries(this._header))
      s !== null && (t[e] = s);
    return t;
  }
  loadPgn(t, { strict: e = !1, newlineChar: s = `\r?
` } = {}) {
    s !== `\r?
` && (t = t.replace(new RegExp(s, "g"), `
`));
    const i = Es(t);
    this.reset();
    const r = i.headers;
    let o = "";
    for (const p in r)
      p.toLowerCase() === "fen" && (o = r[p]), this.header(p, r[p]);
    if (!e)
      o && this.load(o, { preserveHeaders: !0 });
    else if (r.SetUp === "1") {
      if (!("FEN" in r))
        throw new Error("Invalid PGN: FEN tag must be supplied with SetUp tag");
      this.load(r.FEN, { preserveHeaders: !0 });
    }
    let a = i.root;
    for (; a; ) {
      if (a.move) {
        const p = this._moveFromSan(a.move, e);
        if (p == null)
          throw new Error(`Invalid move in PGN: ${a.move}`);
        this._makeMove(p), this._incPositionCount();
      }
      a.comment !== void 0 && (this._comments[this.fen()] = a.comment), a = a.variations[0];
    }
    const u = i.result;
    u && Object.keys(this._header).length && this._header.Result !== u && this.setHeader("Result", u);
  }
  /*
   * Convert a move from 0x88 coordinates to Standard Algebraic Notation
   * (SAN)
   *
   * @param {boolean} strict Use the strict SAN parser. It will throw errors
   * on overly disambiguated moves (see below):
   *
   * r1bqkbnr/ppp2ppp/2n5/1B1pP3/4P3/8/PPPP2PP/RNBQK1NR b KQkq - 2 4
   * 4. ... Nge7 is overly disambiguated because the knight on c6 is pinned
   * 4. ... Ne7 is technically the valid SAN
   */
  _moveToSan(t, e) {
    let s = "";
    if (t.flags & S.KSIDE_CASTLE)
      s = "O-O";
    else if (t.flags & S.QSIDE_CASTLE)
      s = "O-O-O";
    else {
      if (t.flags & S.NULL_MOVE)
        return rt;
      if (t.piece !== I) {
        const i = qs(t, e);
        s += t.piece.toUpperCase() + i;
      }
      t.flags & (S.CAPTURE | S.EP_CAPTURE) && (t.piece === I && (s += K(t.from)[0]), s += "x"), s += K(t.to), t.promotion && (s += "=" + t.promotion.toUpperCase());
    }
    return this._makeMove(t), this.isCheck() && (this.isCheckmate() ? s += "#" : s += "+"), this._undoMove(), s;
  }
  // convert a move from Standard Algebraic Notation (SAN) to 0x88 coordinates
  _moveFromSan(t, e = !1) {
    let s = ot(t);
    if (e || (s === "0-0" ? s = "O-O" : s === "0-0-0" && (s = "O-O-O")), s == rt)
      return {
        color: this._turn,
        from: 0,
        to: 0,
        piece: "k",
        flags: S.NULL_MOVE
      };
    let i = zt(s), r = this._moves({ legal: !0, piece: i });
    for (let m = 0, N = r.length; m < N; m++)
      if (s === ot(this._moveToSan(r[m], r)))
        return r[m];
    if (e)
      return null;
    let o, a, u, p, g, b = !1;
    if (a = s.match(/([pnbrqkPNBRQK])?([a-h][1-8])x?-?([a-h][1-8])([qrbnQRBN])?/), a ? (o = a[1], u = a[2], p = a[3], g = a[4], u.length == 1 && (b = !0)) : (a = s.match(/([pnbrqkPNBRQK])?([a-h]?[1-8]?)x?-?([a-h][1-8])([qrbnQRBN])?/), a && (o = a[1], u = a[2], p = a[3], g = a[4], u.length == 1 && (b = !0))), i = zt(s), r = this._moves({
      legal: !0,
      piece: o || i
    }), !p)
      return null;
    for (let m = 0, N = r.length; m < N; m++)
      if (u) {
        if ((!o || o.toLowerCase() == r[m].piece) && w[u] == r[m].from && w[p] == r[m].to && (!g || g.toLowerCase() == r[m].promotion))
          return r[m];
        if (b) {
          const E = K(r[m].from);
          if ((!o || o.toLowerCase() == r[m].piece) && w[p] == r[m].to && (u == E[0] || u == E[1]) && (!g || g.toLowerCase() == r[m].promotion))
            return r[m];
        }
      } else if (s === ot(this._moveToSan(r[m], r)).replace("x", ""))
        return r[m];
    return null;
  }
  ascii() {
    let t = `   +------------------------+
`;
    for (let e = w.a8; e <= w.h1; e++) {
      if (Se(e) === 0 && (t += " " + "87654321"[le(e)] + " |"), this._board[e]) {
        const s = this._board[e].type, r = this._board[e].color === U ? s.toUpperCase() : s.toLowerCase();
        t += " " + r + " ";
      } else
        t += " . ";
      e + 1 & 136 && (t += `|
`, e += 8);
    }
    return t += `   +------------------------+
`, t += "     a  b  c  d  e  f  g  h", t;
  }
  perft(t) {
    const e = this._moves({ legal: !1 });
    let s = 0;
    const i = this._turn;
    for (let r = 0, o = e.length; r < o; r++)
      this._makeMove(e[r]), this._isKingAttacked(i) || (t - 1 > 0 ? s += this.perft(t - 1) : s++), this._undoMove();
    return s;
  }
  setTurn(t) {
    return this._turn == t ? !1 : (this.move("--"), !0);
  }
  turn() {
    return this._turn;
  }
  board() {
    const t = [];
    let e = [];
    for (let s = w.a8; s <= w.h1; s++)
      this._board[s] == null ? e.push(null) : e.push({
        square: K(s),
        type: this._board[s].type,
        color: this._board[s].color
      }), s + 1 & 136 && (t.push(e), e = [], s += 8);
    return t;
  }
  squareColor(t) {
    if (t in w) {
      const e = w[t];
      return (le(e) + Se(e)) % 2 === 0 ? "light" : "dark";
    }
    return null;
  }
  history({ verbose: t = !1 } = {}) {
    const e = [], s = [];
    for (; this._history.length > 0; )
      e.push(this._undoMove());
    for (; ; ) {
      const i = e.pop();
      if (!i)
        break;
      t ? s.push(new Oe(this, i)) : s.push(this._moveToSan(i, this._moves())), this._makeMove(i);
    }
    return s;
  }
  /*
   * Keeps track of position occurrence counts for the purpose of repetition
   * checking. Old positions are removed from the map if their counts are reduced to 0.
   */
  _getPositionCount(t) {
    return this._positionCount.get(t) ?? 0;
  }
  _incPositionCount() {
    this._positionCount.set(this._hash, (this._positionCount.get(this._hash) ?? 0) + 1);
  }
  _decPositionCount(t) {
    const e = this._positionCount.get(t) ?? 0;
    e === 1 ? this._positionCount.delete(t) : this._positionCount.set(t, e - 1);
  }
  _pruneComments() {
    const t = [], e = {}, s = (i) => {
      i in this._comments && (e[i] = this._comments[i]);
    };
    for (; this._history.length > 0; )
      t.push(this._undoMove());
    for (s(this.fen()); ; ) {
      const i = t.pop();
      if (!i)
        break;
      this._makeMove(i), s(this.fen());
    }
    this._comments = e;
  }
  getComment() {
    return this._comments[this.fen()];
  }
  setComment(t) {
    this._comments[this.fen()] = t.replace("{", "[").replace("}", "]");
  }
  /**
   * @deprecated Renamed to `removeComment` for consistency
   */
  deleteComment() {
    return this.removeComment();
  }
  removeComment() {
    const t = this._comments[this.fen()];
    return delete this._comments[this.fen()], t;
  }
  getComments() {
    return this._pruneComments(), Object.keys(this._comments).map((t) => ({ fen: t, comment: this._comments[t] }));
  }
  /**
   * @deprecated Renamed to `removeComments` for consistency
   */
  deleteComments() {
    return this.removeComments();
  }
  removeComments() {
    return this._pruneComments(), Object.keys(this._comments).map((t) => {
      const e = this._comments[t];
      return delete this._comments[t], { fen: t, comment: e };
    });
  }
  setCastlingRights(t, e) {
    for (const i of [R, ie])
      e[i] !== void 0 && (e[i] ? this._castling[t] |= Ie[i] : this._castling[t] &= ~Ie[i]);
    this._updateCastlingRights();
    const s = this.getCastlingRights(t);
    return (e[R] === void 0 || e[R] === s[R]) && (e[ie] === void 0 || e[ie] === s[ie]);
  }
  getCastlingRights(t) {
    return {
      [R]: (this._castling[t] & Ie[R]) !== 0,
      [ie]: (this._castling[t] & Ie[ie]) !== 0
    };
  }
  moveNumber() {
    return this._moveNumber;
  }
}
const Ks = `[Event "rated blitz game"]
[Site "https://lichess.org/yyznGmXs"]
[Date "2018.12.18"]
[Round "-"]
[White "ZensAlviani"]
[Black "desso2b"]
[Result "1-0"]
[GameId "yyznGmXs"]
[UTCDate "2018.12.18"]
[UTCTime "09:06:21"]
[WhiteElo "1582"]
[BlackElo "1611"]
[WhiteRatingDiff "+11"]
[BlackRatingDiff "-11"]
[Variant "Standard"]
[TimeControl "180+0"]
[ECO "C53"]
[Opening "Italian Game: Classical Variation"]
[Termination "Normal"]

1. e4 { [%eval 0.12] } 1... e5 { [%eval 0.37] } 2. Nf3 { [%eval 0.23] } 2... Nc6 { [%eval 0.15] } 3. Bc4 { [%eval 0.1] } 3... Bc5 { [%eval 0.24] } 4. c3 { [%eval 0.15] } 4... d6 { [%eval 0.27] } 5. O-O { [%eval 0.17] } 5... Bg4 { [%eval 0.5] } 6. a4 { [%eval 0.42] } 6... a6 { [%eval 0.55] } 7. b4 { [%eval 0.61] } 7... Ba7 { [%eval 0.69] } 8. b5 { [%eval -0.19] } 8... axb5 { [%eval 1.36] } 9. axb5 { [%eval 0.97] } 9... Nce7 { [%eval 1.66] } 10. d3 { [%eval -0.8] } 10... Bxf2+ { [%eval -0.6] } 11. Kxf2 { [%eval -1.88] } 11... Rxa1 { [%eval -1.81] } 12. Kg1 { [%eval -3.1] } 12... Rxb1 { [%eval -2.82] } 13. Ba2 { [%eval -5.74] } 13... Ra1 { [%eval -3.62] } 14. Qb3 { [%eval -6.52] } 14... Qa8 { [%eval -3.29] } 15. Ba3 { [%eval -6.97] } 15... Rxf1+ { [%eval -6.83] } 16. Kxf1 { [%eval -6.8] } 16... Bxf3 { [%eval 8.88] } 17. Qxf7+ { [%eval 8.41] } 17... Kd7 { [%eval #2] } 18. Be6+ { [%eval #1] } 18... Kd8 { [%eval #1] } 19. Qf8# 1-0


`, Ds = `[Event "rated classical game"]
[Site "https://lichess.org/YO3ICtJi"]
[Date "2019.04.14"]
[Round "-"]
[White "sanganakam"]
[Black "Msiipola"]
[Result "1-0"]
[GameId "YO3ICtJi"]
[UTCDate "2019.04.14"]
[UTCTime "16:00:52"]
[WhiteElo "1632"]
[BlackElo "1620"]
[WhiteRatingDiff "+11"]
[BlackRatingDiff "-10"]
[Variant "Standard"]
[TimeControl "2700+45"]
[ECO "D00"]
[Opening "Queen's Pawn Game: Accelerated London System"]
[Termination "Normal"]

1. d4 { [%eval 0.25] } 1... d5 { [%eval 0.15] } 2. Bf4 { [%eval 0.0] } 2... Bf5 { [%eval 0.17] } 3. e3 { [%eval 0.11] } 3... Nc6 { [%eval 0.46] } 4. Nd2 { [%eval 0.28] } 4... Qd7 { [%eval 0.61] } 5. h3 { [%eval -0.56] } 5... O-O-O { [%eval 0.93] } 6. c3 { [%eval 0.65] } 6... f6 { [%eval 0.75] } 7. Ne2 { [%eval -0.62] } 7... g5 { [%eval -0.47] } 8. Bh2 { [%eval -0.47] } 8... h5 { [%eval 0.31] } 9. Ng3 { [%eval -0.38] } 9... Bg6 { [%eval -0.34] } 10. Be2 { [%eval 0.24] } 10... h4 { [%eval 0.26] } 11. Ngf1 { [%eval 0.14] } 11... e6 { [%eval 0.37] } 12. f3 { [%eval -1.09] } 12... Bd6 { [%eval -0.67] } 13. f4 { [%eval -1.38] } 13... Rf8 { [%eval -1.67] } 14. b4 { [%eval -1.51] } 14... Nb8 { [%eval -0.72] } 15. a4 { [%eval -1.31] } 15... gxf4 { [%eval -0.7] } 16. exf4 { [%eval -0.71] } 16... Qh7 { [%eval 0.04] } 17. Ne3 { [%eval 0.19] } 17... Qh6 { [%eval 1.0] } 18. O-O { [%eval 1.08] } 18... Nd7 { [%eval 2.95] } 19. Ng4 { [%eval 0.32] } 19... Qg7 { [%eval 0.33] } 20. a5 { [%eval 0.25] } 20... Nh6 { [%eval 0.81] } 21. b5 { [%eval -0.75] } 21... Nxg4 { [%eval -0.68] } 22. Bxg4 { [%eval -0.5] } 22... Re8 { [%eval 0.67] } 23. a6 { [%eval 0.77] } 23... b6 { [%eval 0.67] } 24. f5 { [%eval 0.57] } 24... Bxh2+ { [%eval 0.54] } 25. Kxh2 { [%eval 0.51] } 25... Bxf5 { [%eval 0.52] } 26. Bxf5 { [%eval 0.61] } 26... Qg3+ { [%eval 0.48] } 27. Kh1 { [%eval 0.69] } 27... exf5 { [%eval 0.62] } 28. Rxf5 { [%eval 0.68] } 28... Rhg8 { [%eval 0.88] } 29. Qf3 { [%eval 0.86] } 29... Qxf3 { [%eval 2.49] } 30. Nxf3 { [%eval 2.49] } 30... Re4 { [%eval 2.68] } 31. Rxd5 { [%eval 2.5] } 31... Rge8 { [%eval 3.46] } 32. Rh5 { [%eval 3.51] } 32... Nf8 { [%eval 3.49] } 33. Rxh4 { [%eval 3.63] } 33... Ng6 { [%eval 4.65] } 34. Rxe4 { [%eval 4.48] } 34... Rxe4 { [%eval 4.06] } 35. Re1 { [%eval 3.72] } 35... f5 { [%eval 5.0] } 36. Kh2 { [%eval 4.57] } 36... Kd8 { [%eval 6.35] } 37. Kg3 { [%eval 5.6] } 1-0


`;
function Zt(n) {
  if (!/^\d{1,4}$/.test(String(n ?? ""))) return null;
  const t = Number(n);
  return t > 0 && t <= 4e3 ? t : null;
}
function pt(n, t) {
  const e = (i) => {
    if (i == null || String(i).trim() === "") return null;
    if (!/^\d{1,4}$/.test(String(i).trim())) throw new Error("ELO 請填入 0 到 4000 的整數，留空代表不限。");
    const r = Number(i);
    if (r > 4e3) throw new Error("ELO 請填入 0 到 4000 的整數。");
    return r;
  }, s = { min: e(n), max: e(t) };
  if (s.min !== null && s.max !== null && s.min > s.max) throw new Error("最低 ELO 不能大於最高 ELO。");
  return s;
}
function Be(n, t) {
  return t.min === null && t.max === null ? !0 : [n.whiteElo, n.blackElo].every((e) => Number.isInteger(e) && e > 0 && e >= (t.min ?? 0) && e <= (t.max ?? 4e3));
}
const Ke = { "-2": "黑方大優", "-1": "黑方小優", 1: "白方小優", 2: "白方大優" };
function gt(n) {
  return n === 0 ? null : n <= -200 ? -2 : n < 0 ? -1 : n < 200 ? 1 : 2;
}
function Fs(n) {
  return n.trim().split(/\n\s*(?=\[Event\s)/).filter((t) => t.trim());
}
function nn(...n) {
  for (const t of n)
    try {
      const e = new URL(t);
      if (e.protocol !== "https:" || e.username || e.password || e.port) continue;
      if (["lichess.org", "www.lichess.org"].includes(e.hostname)) {
        const s = e.pathname.match(/^\/([a-zA-Z0-9]{8})(?:[a-zA-Z0-9]{4})?(?:\/(?:white|black))?\/?$/);
        if (s) return `https://lichess.org/${s[1]}`;
      }
      if (["chess.com", "www.chess.com"].includes(e.hostname) && /^\/(?:game\/(?:live|daily)|(?:live|daily)\/game|analysis\/game\/(?:live|daily))\/\d+(?:\/.*)?$/.test(e.pathname))
        return e.hash = "", e.search = "", e.href;
    } catch {
    }
  return null;
}
function Us(n, t) {
  const e = nn(n);
  if (!e || !Number.isInteger(t) || t < 1) return null;
  const s = new URL(e);
  if (s.hostname === "lichess.org")
    return s.hash = String(t), s.href;
  const i = s.pathname.match(/\/(?:game\/(live|daily)|(live|daily)\/game)\/(\d+)/);
  return i ? `https://www.chess.com/analysis/game/${i[1] || i[2]}/${i[3]}?tab=analysis&move=${t - 1}` : null;
}
function dt(n, t = "匯入棋譜", e = null) {
  var i;
  const s = [];
  for (const r of Fs(n))
    try {
      const o = (i = r.match(/\[Result\s+"([^"]+)"\]/)) == null ? void 0 : i[1];
      if (o && !["1-0", "0-1", "1/2-1/2"].includes(o)) continue;
      const a = new xe();
      a.loadPgn(r);
      const u = a.getHeaders();
      if (!["1-0", "0-1", "1/2-1/2"].includes(u.Result) || u.Variant && !["Standard", "Chess"].includes(u.Variant)) continue;
      const p = a.history({ verbose: !0 }), g = nn(e, u.Link, u.Site);
      for (let b = 15; b < p.length - 2; b += 3) {
        const m = p[b].after, N = new xe(m);
        if (N.isGameOver()) continue;
        const E = (Number(m.split(" ")[5]) - 1) * 2 + (N.turn() === "b" ? 1 : 0), x = p[b], k = `${x.before.split(" ")[5]}${x.color === "w" ? "." : "…"} ${x.san} 之後`, D = p.slice(0, b + 1).map((B) => ({ from: B.from, to: B.to, san: B.san, color: B.color, before: B.before, after: B.after }));
        s.push({ fen: m, ply: E, moveLabel: k, leadIn: D, source: t, white: u.White || "白方", black: u.Black || "黑方", whiteElo: Zt(u.WhiteElo), blackElo: Zt(u.BlackElo), url: g });
      }
    } catch {
    }
  return [...new Map(s.map((r) => [r.fen, r])).values()];
}
function Bs(n, t) {
  var r, o, a;
  const e = n.match(/\bscore (cp|mate) (-?\d+)/);
  if (!e || /\b(?:upperbound|lowerbound)\b/.test(n)) return null;
  const s = Number(e[2]), i = t === "w" ? 1 : -1;
  return {
    cp: e[1] === "cp" ? s * i : Math.sign(s || -1) * 1e5 * i,
    mate: e[1] === "mate" ? s * i : null,
    depth: Number(((r = n.match(/\bdepth (\d+)/)) == null ? void 0 : r[1]) || 0),
    pv: ((a = (o = n.match(/\bpv (.+)/)) == null ? void 0 : o[1]) == null ? void 0 : a.trim().split(/\s+/)) || []
  };
}
function sn(n, t) {
  const e = new xe(n), s = [];
  for (const i of t.slice(0, 5))
    try {
      s.push(e.move({ from: i.slice(0, 2), to: i.slice(2, 4), promotion: i[4] }).san);
    } catch {
      break;
    }
  return s.join(" → ");
}
const De = {
  critical: { icon: "!", label: "關鍵好棋", color: "#719bcd" },
  best: { icon: "★", label: "最佳", color: "#a7cf65" },
  excellent: { icon: "👍", label: "優秀", color: "#91bb73" },
  good: { icon: "✓", label: "尚可", color: "#a3b38b" },
  inaccuracy: { icon: "?!", label: "不精確", color: "#e8ba43" },
  mistake: { icon: "?", label: "失誤", color: "#ee944a" },
  blunder: { icon: "??", label: "嚴重失誤", color: "#ec6868" }
};
function Fe(n) {
  return n.mate !== null ? `${n.cp > 0 ? "+" : "−"}M${Math.abs(n.mate)}` : `${n.cp > 0 ? "+" : ""}${(n.cp / 100).toFixed(2)}`;
}
function Qs(n) {
  return 100 / (1 + Math.exp(-Math.max(-2e3, Math.min(2e3, n)) / 250));
}
function Gs(n, t, e) {
  var u, p;
  const s = e.color === "w" ? 1 : -1, i = Math.max(0, (n.cp - t.cp) * s), r = ((u = n.pv) == null ? void 0 : u[0]) === e.lan, o = (p = n.lines) == null ? void 0 : p.find((g) => g.rank === 2 && g.depth === n.depth);
  let a = i < 10 ? "excellent" : i < 50 ? "good" : i < 100 ? "inaccuracy" : i < 200 ? "mistake" : "blunder";
  return r && i < 50 && (a = "best"), a === "best" && o && n.cp * s >= -50 && o.cp * s <= -150 && (n.cp - o.cp) * s >= 150 && (a = "critical"), { kind: a, loss: i, before: n, after: t };
}
function js(n, t, e) {
  var i;
  const s = Number(((i = e.match(/\bmultipv (\d+)/)) == null ? void 0 : i[1]) || 1);
  n.has(t.depth) || n.set(t.depth, /* @__PURE__ */ new Map()), n.get(t.depth).set(s, { ...t, rank: s });
}
function Ws(n) {
  const e = [...n.keys()].sort((i, r) => r - i).find((i) => n.get(i).has(1));
  if (e === void 0) return null;
  const s = [...n.get(e).values()].sort((i, r) => i.rank - r.rank);
  return { ...n.get(e).get(1), lines: s };
}
class rn {
  async evaluate(t) {
    return this.cancel(), new Promise((e, s) => {
      const i = /* @__PURE__ */ new Map();
      let r = !1;
      const o = new Worker(new URL("./chess-engine/stockfish-18-lite-single.js", document.baseURI));
      this.worker = o;
      const a = () => {
        clearTimeout(p), o.terminate(), this.worker === o && (this.worker = null, this.cancelCurrent = null);
      }, u = (g) => {
        a(), s(new Error(g));
      }, p = setTimeout(() => u("引擎載入或分析逾時，請重試。"), 3e4);
      this.cancelCurrent = () => {
        a(), s(new Error("分析已取消"));
      }, o.onerror = () => u("Stockfish 無法啟動。請確認瀏覽器支援 WebAssembly，並重新分析。"), o.onmessage = ({ data: g }) => {
        if (typeof g == "string")
          for (const b of g.split(`
`)) {
            if (b === "uciok" && (o.postMessage("setoption name Hash value 16"), o.postMessage("setoption name MultiPV value 3"), o.postMessage("isready")), b === "readyok" && !r && (r = !0, o.postMessage(`position fen ${t}`), o.postMessage("go depth 18 movetime 3000")), b.startsWith("info ")) {
              const m = Bs(b, t.split(" ")[1]);
              m && js(i, m, b);
            }
            if (b.startsWith("bestmove ")) {
              const m = Ws(i);
              a(), m ? e(m) : s(new Error("引擎未回傳有效分數，請重新分析。"));
            }
          }
      }, o.postMessage("uci");
    });
  }
  cancel() {
    var t;
    (t = this.cancelCurrent) == null || t.call(this);
  }
}
class Hs {
  constructor(t) {
    this.originalFen = t, this.chess = new xe(t), this.selected = null, this.pending = null, this.future = [];
  }
  targets() {
    return this.selected ? this.chess.moves({ square: this.selected, verbose: !0 }) : [];
  }
  select(t) {
    if (this.pending || this.chess.isGameOver()) return "blocked";
    if (this.selected === t)
      return this.selected = null, "selected";
    if (this.selected && this.targets().some((s) => s.to === t)) return this.move(this.selected, t);
    const e = this.chess.get(t);
    return this.selected = (e == null ? void 0 : e.color) === this.chess.turn() ? t : null, "selected";
  }
  move(t, e) {
    if (this.pending || this.chess.isGameOver()) return "blocked";
    const s = this.chess.moves({ square: t, verbose: !0 }).filter((i) => i.to === e);
    return s.length ? s.some((i) => i.promotion) ? (this.pending = { from: t, to: e }, this.selected = t, "promotion") : (this.chess.move({ from: t, to: e }), this.future = [], this.selected = null, "moved") : "illegal";
  }
  promote(t) {
    return !this.pending || !["q", "r", "b", "n"].includes(t) ? "illegal" : (this.chess.move({ ...this.pending, promotion: t }), this.future = [], this.selected = null, this.pending = null, "moved");
  }
  cancelPromotion() {
    this.pending = null, this.selected = null;
  }
  undo() {
    if (this.pending)
      return this.cancelPromotion(), null;
    this.selected = null;
    const t = this.chess.undo();
    return t && this.future.push(t), t;
  }
  redo() {
    if (this.pending || !this.future.length) return null;
    this.selected = null;
    const t = this.future.at(-1), e = this.chess.move({ from: t.from, to: t.to, promotion: t.promotion });
    return this.future.pop(), e;
  }
  reset() {
    for (this.cancelPromotion(); this.chess.history().length; ) this.undo();
  }
  terminal() {
    return this.chess.isCheckmate() ? `${this.chess.turn() === "w" ? "黑" : "白"}方將死對手，試走結束。` : this.chess.isStalemate() ? "無合法著法且未被將軍：逼和。" : this.chess.isThreefoldRepetition() ? "同一局面出現三次：和棋。" : this.chess.isInsufficientMaterial() ? "子力不足以將死：和棋。" : this.chess.isDrawByFiftyMoves() ? "五十回合未吃子或移動兵：和棋。" : null;
  }
}
class Vs {
  constructor(t, e) {
    this.moves = t || [], this.fallbackFen = e, this.index = this.moves.length;
  }
  get atQuestion() {
    return this.index === this.moves.length;
  }
  get fen() {
    var t;
    return this.index ? this.moves[this.index - 1].after : ((t = this.moves[0]) == null ? void 0 : t.before) || this.fallbackFen;
  }
  get lastMove() {
    return this.index ? this.moves[this.index - 1] : null;
  }
  step(t) {
    const e = Math.max(0, Math.min(this.moves.length, this.index + Math.sign(t))), s = e !== this.index;
    return this.index = e, s;
  }
  returnToQuestion() {
    this.index = this.moves.length;
  }
}
function Qe(n, t = !1) {
  if (!/^[a-h][1-8]$/.test(n)) return null;
  let e = n.charCodeAt(0) - 97, s = 8 - Number(n[1]);
  return t && (e = 7 - e, s = 7 - s), { x: e * 100 + 50, y: s * 100 + 50 };
}
function Ys(n, t, e, s, i = !1) {
  if (e <= 0 || s <= 0 || n < 0 || t < 0 || n >= e || t >= s) return null;
  let r = Math.floor(n / e * 8), o = 7 - Math.floor(t / s * 8);
  return i && (r = 7 - r, o = 7 - o), "abcdefgh"[r] + (o + 1);
}
class zs {
  constructor() {
    this.positions = /* @__PURE__ */ new Map();
  }
  shapes(t) {
    var e;
    return [...((e = this.positions.get(t)) == null ? void 0 : e.values()) || []];
  }
  toggle(t, e, s, i = "green") {
    if (!Qe(e) || !Qe(s)) return;
    this.positions.has(t) || this.positions.set(t, /* @__PURE__ */ new Map());
    const r = this.positions.get(t), o = `${e}:${s}:${i}`;
    r.has(o) ? r.delete(o) : r.set(o, { from: e, to: s, color: i });
  }
  clear(t) {
    this.positions.delete(t);
  }
  reset() {
    this.positions.clear();
  }
}
const c = (n) => document.getElementById(n), Ve = new rn(), Ge = new rn();
let _ = null, Ue = 0, re = null, A = null, P = null, Z = !1;
const Ae = new zs();
let ve = /* @__PURE__ */ new Map(), be = /* @__PURE__ */ new Map(), ce = null;
const mt = (n) => n.map((t) => t.lan).join(" ");
let je = dt(Ks + `

` + Ds, "Lichess 內建真實棋局"), ge = [], L = null, H = null, V = pt(null, null);
try {
  const n = JSON.parse(localStorage.getItem("chess-intuition-elo"));
  n && (V = pt(n.min, n.max));
} catch {
}
let J = !1, X = !1, G = !1, O = !1, me = 0, at = 0, lt = 0, ct = 0, Xt = 0, We = 0;
const Zs = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" }, Jt = { k: "王", q: "后", r: "車", b: "象", n: "馬", p: "兵" };
function Xs(n) {
  const t = [...n];
  for (let e = t.length - 1; e > 0; e--) {
    const s = Math.floor(Math.random() * (e + 1));
    [t[e], t[s]] = [t[s], t[e]];
  }
  return t;
}
function vt() {
  const n = je.filter((s) => Be(s, V)), t = new Set(n.map((s) => s.url || `${s.source}|${s.white}|${s.black}`)).size, e = V.min === null && V.max === null ? "ELO 不限" : `雙方 ELO ${V.min ?? 0}–${V.max ?? 4e3}`;
  c("elo-status").textContent = `${e} · 目前已載入的題庫符合 ${t} 場、${n.length} 個候選局面（出題前另排除 0.00）`;
}
async function on(n, t = !1) {
  if (n == null || n.preventDefault(), O) {
    c("elo-status").textContent = "正在匯入棋局，請完成後再套用範圍。";
    return;
  }
  let e;
  try {
    e = pt(t ? "" : c("elo-min").value, t ? "" : c("elo-max").value);
  } catch (s) {
    c("elo-status").textContent = s.message;
    return;
  }
  V = e, c("elo-min").value = e.min ?? "", c("elo-max").value = e.max ?? "";
  try {
    localStorage.setItem("chess-intuition-elo", JSON.stringify(e));
  } catch {
  }
  ++me, Ve.cancel(), G = !1, ge = [], vt(), await ke(), L && c("settings-dialog").close();
}
function Ne() {
  return (_ == null ? void 0 : _.chess.fen()) || (A == null ? void 0 : A.fen) || (L == null ? void 0 : L.fen);
}
function _t() {
  if (!L) {
    c("undo").disabled = !0, c("redo").disabled = !0, c("reset-position").disabled = !0, c("clear-marks").disabled = !0, c("history-position").textContent = "";
    return;
  }
  const n = _ == null ? void 0 : _.chess.history({ verbose: !0 }), t = G || O || !!(_ != null && _.pending);
  c("undo").disabled = t || !(_ ? n.length : A != null && A.index), c("redo").disabled = t || !(_ ? _.future.length : A && !A.atQuestion), c("reset-position").disabled = G || O || !(_ ? n.length || _.pending : A && !A.atQuestion), c("history-position").textContent = _ ? `試走 ${n.length} / ${n.length + _.future.length}` : A != null && A.atQuestion ? "原題局面" : `回看 ${A.index} / ${A.moves.length}`, c("replay-notice").hidden = X || !A || A.atQuestion, c("session-mode").textContent = X ? "自由試走，檢查你的判斷。" : A && !A.atQuestion ? "正在回看，回到原題後作答。" : "觀察局面，判斷哪方有優勢。", Ee(!G && !O && !!H && !X);
}
function te() {
  var u, p;
  if (!L) return;
  const n = (_ == null ? void 0 : _.chess) || new xe(Ne()), t = n.board().flat();
  J && t.reverse();
  const e = new Set((_ == null ? void 0 : _.targets().map((g) => g.to)) || []), s = _ ? _.chess.history({ verbose: !0 }).at(-1) || (A == null ? void 0 : A.moves.at(-1)) : A == null ? void 0 : A.lastMove, i = _ && be.get(mt(_.chess.history({ verbose: !0 }))), r = c("board").contains(document.activeElement) ? (u = document.activeElement) == null ? void 0 : u.dataset.square : null;
  c("board").replaceChildren();
  const o = [];
  for (let g = 0; g < 64; g++) {
    const b = J ? Math.floor(g / 8) + 1 : 8 - Math.floor(g / 8), m = "abcdefgh"[J ? 7 - g % 8 : g % 8], N = t[g], E = m + b, x = document.createElement(_ ? "button" : "div");
    if (x.className = `square ${(Math.floor(g / 8) + g % 8) % 2 ? "dark" : ""}`, x.dataset.square = E, x.classList.toggle("last-move", (s == null ? void 0 : s.from) === E || (s == null ? void 0 : s.to) === E), x.classList.toggle("in-check", (N == null ? void 0 : N.type) === "k" && N.color === n.turn() && n.isCheck()), _ && (x.type = "button", x.setAttribute("aria-label", `${E} ${N ? `${N.color === "w" ? "白" : "黑"}${Jt[N.type]}` : "空格"}${e.has(E) ? "，可走" : ""}`), x.classList.toggle("selected-square", _.selected === E), x.classList.toggle("legal-target", e.has(E)), x.addEventListener("click", () => {
      if (O || Z) return;
      const k = _.select(E);
      he(k, E);
    }), x.draggable = !!N && N.color === n.turn() && !_.pending && !n.isGameOver() && !O && !Z, x.addEventListener("dragstart", (k) => {
      re = E, k.dataTransfer.setData("text/plain", E), k.dataTransfer.effectAllowed = "move";
    }), x.addEventListener("dragover", (k) => {
      re && k.preventDefault();
    }), x.addEventListener("drop", (k) => {
      if (k.preventDefault(), !re || O) return;
      const D = re;
      re = null, he(_.move(D, E), E);
    }), x.addEventListener("dragend", () => {
      re = null;
    }), x.addEventListener("keydown", (k) => {
      const D = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -8, ArrowDown: 8 }[k.key];
      if (D === void 0) return;
      k.preventDefault();
      const B = g + D;
      B >= 0 && B < 64 && (Math.abs(D) !== 1 || Math.floor(g / 8) === Math.floor(B / 8)) && c("board").children[B].focus();
    })), N) {
      const k = document.createElement("span");
      k.className = `piece ${N.color}`, k.textContent = Zs[N.type], x.append(k), o.push(`${m}${b} ${N.color === "w" ? "白" : "黑"}${Jt[N.type]}`);
    }
    if ((s == null ? void 0 : s.to) === E && i) {
      const k = document.createElement("span");
      k.className = "move-badge", k.textContent = De[i.kind].icon, k.style.background = De[i.kind].color, k.title = De[i.kind].label, x.append(k);
    }
    if (g % 8 === 0) {
      const k = document.createElement("span");
      k.className = "coord rank", k.textContent = b, x.append(k);
    }
    if (g >= 56) {
      const k = document.createElement("span");
      k.className = "coord file", k.textContent = m, x.append(k);
    }
    c("board").append(x);
  }
  const a = n.turn() === "w";
  c("turn").textContent = a ? "白方行棋" : "黑方行棋", c("turn").classList.toggle("black-turn", !a), c("board").setAttribute("aria-label", `${a ? "白" : "黑"}方行棋；${o.join("，")}`), c("board").setAttribute("role", _ ? "group" : "img"), c("source-label").textContent = _ ? "試走模式" : A != null && A.atQuestion ? L.source : "原局回看", c("move-number").textContent = s ? `${s.before.split(" ")[5]}${s.color === "w" ? "." : "…"} ${s.san}` : "起始局面", c("eval-track").classList.toggle("flipped", J), _t(), ue(), r && _ && ((p = c("board").querySelector(`[data-square="${r}"]`)) == null || p.focus({ preventScroll: !0 }));
}
function Js() {
  ++Ue, Ge.cancel(), _ = null, A = null, P = null, Ae.reset(), c("board-annotations").replaceChildren(), re = null, ve.clear(), be.clear(), ce = null, c("simulation").hidden = !0, c("eval-panel").hidden = !0, c("question-content").hidden = !1, c("replay-notice").hidden = !0;
}
function an(n) {
  const t = n.mate !== null ? `${n.cp > 0 ? "白" : "黑"}方 ${Math.abs(n.mate)} 步將殺` : `${n.cp > 0 ? "+" : ""}${(n.cp / 100).toFixed(2)}`;
  c("simulation-score").textContent = `試走評估：${t} · ${Ke[gt(n.cp)] || "均勢"} · 深度 ${n.depth}`, c("eval-panel").hidden = !1, c("eval-value").textContent = Fe(n), c("eval-white").style.height = `${Qs(n.cp)}%`, c("eval-track").setAttribute("aria-label", `目前局面白方視角 ${Fe(n)}；長度為優勢示意，非勝率`), ce = n.pv[0] || null, c("play-suggestion").disabled = !ce || !!_.pending || _.chess.isGameOver(), c("suggestions").replaceChildren();
  for (const e of n.lines || [n]) {
    const s = document.createElement("div");
    s.className = "suggestion-line";
    const i = document.createElement("strong");
    i.textContent = Fe(e);
    const r = document.createElement("span");
    r.textContent = sn(_.chess.fen(), e.pv), s.append(i, r), c("suggestions").append(s);
  }
}
async function ln() {
  const n = ++Ue;
  Ge.cancel();
  const t = _.chess.history({ verbose: !0 }), e = _.chess.fen(), s = _.terminal();
  ce = null, c("play-suggestion").disabled = !0, c("suggestions").replaceChildren(), c("eval-value").textContent = "…", c("eval-white").style.height = "50%", c("eval-track").setAttribute("aria-label", "正在分析"), c("simulation-score").textContent = "正在分析試走局面…";
  const i = () => n === Ue && _;
  async function r(o) {
    if (ve.has(o)) return ve.get(o);
    const a = await Ge.evaluate(o);
    if (!i()) throw new Error("已切換局面");
    return ve.set(o, a), a;
  }
  try {
    let o;
    if (s) {
      const a = _.chess.isCheckmate();
      o = { cp: a ? _.chess.turn() === "w" ? -1e5 : 1e5 : 0, mate: a ? 0 : null, depth: 0, pv: [], lines: [] };
    } else o = await r(e);
    if (!i()) return;
    an(o), s && (c("simulation-score").textContent = s);
    for (let a = 0; a < t.length; a++) {
      const u = mt(t.slice(0, a + 1));
      if (be.has(u)) continue;
      const p = t[a], g = await r(p.before), b = a === t.length - 1 ? o : await r(p.after);
      if (!i()) return;
      be.set(u, Gs(g, b, p)), Ye(), te();
    }
  } catch (o) {
    n === Ue && _ && (c("simulation-score").textContent = o.message);
  }
}
function Ye() {
  const n = _.chess.history({ verbose: !0 });
  c("simulation").hidden = !1, _t(), c("promotion").hidden = !_.pending;
  const t = _.terminal();
  c("simulation-instruction").textContent = _.pending ? "請選擇升變棋子。" : t || (_.chess.isCheck() ? "被將軍，請先解將。" : _.future.length ? "可向前重播，或改走新的路線。" : "點棋子再點目的地試走，可用箭頭回看。"), c("original-game-link").hidden = !L.url, c("original-game-missing").hidden = !!L.url, L.url && (c("original-game-link").href = Us(L.url, L.ply) || L.url, c("original-game-link").textContent = `原始對局 · ${L.moveLabel} ↗`), c("simulation-history").replaceChildren(), n.length || (c("simulation-history").textContent = "目前是原題局面。"), n.forEach((e, s) => {
    const i = be.get(mt(n.slice(0, s + 1))), r = i && De[i.kind], o = document.createElement("span");
    o.className = "review-move";
    const a = document.createElement("b");
    a.textContent = (r == null ? void 0 : r.icon) || "…", a.style.color = (r == null ? void 0 : r.color) || "#a0aeaf", o.append(a, document.createTextNode(` ${e.before.split(" ")[5]}${e.color === "w" ? "." : "…"} ${e.san} · ${(r == null ? void 0 : r.label) || "待評分"}`)), o.title = i ? `${r.label}；行棋方評估損失 ${Math.min(i.loss / 100, 1e3).toFixed(2)}；原先建議 ${sn(e.before, i.before.pv)}` : "引擎正在排程分析", c("simulation-history").append(o);
  }), c("play-suggestion").disabled = !ce || !!_.pending || _.chess.isGameOver();
}
function he(n, t) {
  var e;
  if (n === "illegal") {
    c("simulation-instruction").textContent = "這步不合法，請選擇有標記的目的地。";
    return;
  }
  te(), Ye(), t && ((e = c("board").querySelector(`[data-square="${t}"]`)) == null || e.focus({ preventScroll: !0 })), n === "promotion" && c("promotion").querySelector("button").focus({ preventScroll: !0 }), n === "moved" && ln();
}
function bt(n) {
  if (!(!L || G || O || P))
    if (_) {
      if (_.pending) return;
      (n < 0 ? _.undo() : _.redo()) && he("moved");
    } else A != null && A.step(n) && te();
}
function cn() {
  !L || G || O || (_ ? (_.reset(), he("moved")) : (A == null || A.returnToQuestion(), te()));
}
function $e(n, t) {
  const e = document.createElementNS("http://www.w3.org/2000/svg", n);
  for (const [s, i] of Object.entries(t)) e.setAttribute(s, String(i));
  return e;
}
function ue() {
  const n = c("board-annotations");
  n.replaceChildren();
  const t = Ne();
  if (!t) return;
  const e = { green: "#237943", red: "#c94442" }, s = $e("defs", {});
  for (const [r, o] of Object.entries(e)) {
    const a = $e("marker", { id: `note-arrow-${r}`, viewBox: "0 0 32 32", refX: 27, refY: 16, markerWidth: 34, markerHeight: 34, markerUnits: "userSpaceOnUse", orient: "auto" });
    a.append($e("path", { d: "M 2 2 L 29 16 L 2 30 L 9 16 Z", fill: o })), s.append(a);
  }
  n.append(s);
  const i = Ae.shapes(t);
  P != null && P.to && i.push(P);
  for (const r of i) {
    const o = Qe(r.from, J), a = Qe(r.to, J);
    if (!(!o || !a))
      if (r.from === r.to) n.append($e("circle", { cx: o.x, cy: o.y, r: 40, stroke: e[r.color], fill: "none", "stroke-width": 10, opacity: 0.82 }));
      else {
        const u = a.x - o.x, p = a.y - o.y, g = Math.hypot(u, p);
        n.append($e("line", { x1: o.x, y1: o.y, x2: a.x - u / g * 14, y2: a.y - p / g * 14, stroke: e[r.color], "stroke-width": 14, "stroke-linecap": "round", "marker-end": `url(#note-arrow-${r.color})`, opacity: 0.85 }));
      }
  }
  c("clear-marks").disabled = !Ae.shapes(t).length && !P;
}
function Et(n) {
  const t = c("board").getBoundingClientRect();
  return Ys(n.clientX - t.left - 4, n.clientY - t.top - 4, t.width - 8, t.height - 8, J);
}
function hn() {
  P = null;
  const n = Ne();
  n && Ae.clear(n), ue();
}
function ei() {
  Z = !Z, P = null, re = null, _ && (_.selected = null), c("mark-mode").setAttribute("aria-pressed", String(Z)), c("mark-mode").textContent = Z ? "完成" : "標記", c("board-surface").classList.toggle("marking-mode", Z), c("marking-hint").hidden = !Z, c("gesture-hint").hidden = Z, te();
}
function Ee(n) {
  document.querySelectorAll("[data-choice]").forEach((t) => t.disabled = !(n && (A != null && A.atQuestion) && !X));
}
function pe(n) {
  c("engine-status").textContent = n;
}
async function ke(n = !1) {
  if (G || O) return;
  Js(), G = !0;
  const t = ++me;
  H = null, X = !1, We = 0, Ee(!1), c("next").disabled = !0, c("retry").hidden = !0, c("result").hidden = !0, document.querySelectorAll("[data-choice]").forEach((e) => {
    e.classList.remove("selected", "correct"), e.removeAttribute("aria-pressed");
  });
  try {
    const e = je.filter((o) => Be(o, V));
    if (vt(), !e.length) {
      L = null, c("board-surface").hidden = !0, c("empty-pool").hidden = !1, c("turn").textContent = "等待棋局", c("move-number").textContent = "", c("source-label").textContent = "沒有符合範圍的局面", c("question-number").textContent = "—", pe("請在設定中調整 ELO 或匯入棋局。");
      return;
    }
    c("board-surface").hidden = !1, c("empty-pool").hidden = !0;
    const s = n && L ? [L] : null;
    let i = 0;
    ge.length || (ge = Xs(e));
    const r = s ? 1 : ge.length;
    for (let o = 0; o < r; o++) {
      L = s ? s[0] : ge.pop(), A = new Vs(L.leadIn, L.fen), te(), pe(i ? "已跳過 0.00 局面，正在分析下一題…" : "正在分析局面；完成後即可作答…");
      const a = await Ve.evaluate(L.fen);
      if (t !== me) return;
      if (gt(a.cp) === null) {
        i++;
        continue;
      }
      H = a, Xt++, c("question-number").textContent = `局面 ${String(Xt).padStart(2, "0")}`, pe("評估已就緒，答案會在選擇後揭曉。"), We = Date.now(), c("timer").textContent = "00:00", Ee(!O);
      return;
    }
    pe("這批局面皆為 0.00，已排除。請匯入其他棋局，或再抽取一批。"), c("next").disabled = !1;
  } catch (e) {
    t === me && (pe(e.message), c("retry").hidden = !1, c("next").disabled = !1);
  } finally {
    t === me && (G = !1, _t());
  }
}
function un(n) {
  if (G || O || X || !H || !(A != null && A.atQuestion)) return null;
  if (![-2, -1, 1, 2].includes(n)) throw new Error("請選擇四種優勢之一。");
  X = !0, Ee(!1);
  const t = gt(H.cp), e = n === t;
  at++, lt += Number(e), ct = e ? ct + 1 : 0, document.querySelector(`[data-choice="${n}"]`).classList.add("selected"), document.querySelector(`[data-choice="${n}"]`).setAttribute("aria-pressed", "true"), document.querySelector(`[data-choice="${t}"]`).classList.add("correct"), c("accuracy").textContent = `${Math.round(lt / at * 100)}%`, c("stats").textContent = `${lt} / ${at} 題 · 連對 ${ct}`;
  const s = c("result");
  s.replaceChildren(), s.hidden = !1;
  const i = document.createElement("strong");
  i.textContent = e ? "✓ 直覺命中" : "再校準一下棋感", s.append(i);
  const r = document.createElement("p");
  r.textContent = `原題：${Ke[t]} ${Fe(H)}${e ? "" : ` · 你選了${Ke[n]}`}`, s.append(r);
  const o = document.createElement("p");
  return o.className = "player-line", o.textContent = `${L.white} ${L.whiteElo ?? "?"} · ${L.black} ${L.blackElo ?? "?"}`, s.append(o), c("question-content").hidden = !0, pe(`Stockfish 18 Lite · 深度 ${H.depth} · 分數以白方視角表示`), c("next").disabled = !1, _ = new Hs(L.fen), ve.set(L.fen, H), te(), Ye(), an(H), { correct: e, answer: Ke[t], cp: H.cp };
}
async function ht(n, t = "application/x-chess-pgn") {
  const e = await fetch(n, { headers: { Accept: t }, signal: AbortSignal.timeout(25e3) });
  if (!e.ok) throw new Error(e.status === 429 ? "平台暫時限制請求，請稍後再試，或貼上 PGN。" : `無法取得棋局（${e.status}），請確認連結或玩家名稱，或改用 PGN。`);
  return e.text();
}
async function ti(n) {
  if (n.preventDefault(), O) return;
  const t = c("import-value").value.trim(), e = c("provider").value;
  if (t) {
    O = !0, c("import-submit").disabled = !0, Ee(!1), c("next").disabled = !0, c("import-status").textContent = "正在取得棋譜…";
    try {
      let s = t, i = "匯入 PGN", r = null;
      if (e === "lichess-game") {
        const a = t.match(/^(?:https:\/\/(?:www\.)?lichess\.org\/)?([a-zA-Z0-9]{8})(?:[a-zA-Z0-9]{4})?(?:[\/#?].*)?$/);
        if (!a) throw new Error("請輸入有效的 Lichess 對局連結或 8 碼 ID。");
        s = await ht(`https://lichess.org/game/export/${a[1]}?clocks=false&evals=false`), i = "Lichess 匯入對局";
      } else if (e === "lichess-user") {
        if (!/^[\w-]{2,30}$/.test(t)) throw new Error("請輸入玩家名稱，不是個人頁面網址。");
        s = await ht(`https://lichess.org/api/games/user/${encodeURIComponent(t)}?max=5&ongoing=false&finished=true&clocks=false&evals=false`), i = "Lichess 玩家棋局";
      } else if (e === "chesscom") {
        if (!/^[\w-]{2,30}$/.test(t)) throw new Error("請輸入玩家名稱，不是個人頁面網址。");
        const a = /* @__PURE__ */ new Date(), u = a.getUTCFullYear(), p = String(a.getUTCMonth() + 1).padStart(2, "0"), g = JSON.parse(await ht(`https://api.chess.com/pub/player/${encodeURIComponent(t.toLowerCase())}/games/${u}/${p}`, "application/json"));
        i = "Chess.com 玩家棋局", r = (g.games || []).filter((b) => b.rules === "chess" && b.pgn).slice(-8).flatMap((b) => dt(b.pgn, i, b.url));
      }
      if (r ?? (r = dt(s, i)), !r.length) throw new Error("找不到可用局面。請使用已結束、超過 9 回合的標準棋局；Chess.com 本月無棋局可改貼其他月份的 PGN。");
      ++me, Ve.cancel(), G = !1, je = r, ge = [];
      const o = r.filter((a) => Be(a, V)).length;
      c("import-status").textContent = `已載入 ${r.length} 個候選局面，其中 ${o} 個符合目前 ELO 範圍；出題前會排除引擎 0.00 的局面。`, O = !1, await ke(), L && c("settings-dialog").close();
    } catch (s) {
      c("import-status").textContent = s.name === "TypeError" || s.name === "TimeoutError" ? "連線失敗或逾時。請稍後再試，或從平台匯出 PGN 貼上；目前題庫仍保留。" : s.message;
    } finally {
      O = !1, c("import-submit").disabled = !1, H && !X && Ee(!0), !G && (!H || X) && (c("next").disabled = !je.some((s) => Be(s, V)));
    }
  }
}
document.querySelectorAll("[data-choice]").forEach((n) => n.addEventListener("click", () => un(Number(n.dataset.choice))));
c("next").addEventListener("click", () => ke());
c("retry").addEventListener("click", () => ke(!0));
c("flip").addEventListener("click", () => {
  J = !J, te();
});
c("import-form").addEventListener("submit", ti);
c("elo-form").addEventListener("submit", on);
c("elo-reset").addEventListener("click", (n) => on(n, !0));
c("undo").addEventListener("click", () => bt(-1));
c("redo").addEventListener("click", () => bt(1));
c("reset-position").addEventListener("click", cn);
c("return-question").addEventListener("click", cn);
c("clear-marks").addEventListener("click", hn);
c("mark-mode").addEventListener("click", ei);
let de = 0, en = 0;
c("board-surface").addEventListener("wheel", (n) => {
  if (n.ctrlKey || Math.abs(n.deltaX) > Math.abs(n.deltaY) || !L || (n.preventDefault(), G || O || P)) return;
  const t = n.deltaY * (n.deltaMode === 1 ? 24 : n.deltaMode === 2 ? 300 : 1), e = performance.now();
  Math.sign(t) !== Math.sign(de) && (de = 0), de += t, Math.abs(de) >= 24 && e - en >= 150 && (bt(Math.sign(de)), de = 0, en = e);
}, { passive: !1 });
const ee = c("board-surface");
ee.addEventListener("contextmenu", (n) => n.preventDefault());
ee.addEventListener("pointerdown", (n) => {
  if (n.button !== 2 && !(Z && n.button === 0) || !n.isPrimary || !L || O || P) return;
  const t = Et(n);
  t && (n.preventDefault(), P = { from: t, to: t, color: n.shiftKey ? "red" : "green", pointerId: n.pointerId, fen: Ne() }, ee.setPointerCapture(n.pointerId), ue());
});
ee.addEventListener("pointermove", (n) => {
  !P || n.pointerId !== P.pointerId || (n.preventDefault(), P.to = Et(n), ue());
});
ee.addEventListener("pointerup", (n) => {
  if (!P || n.pointerId !== P.pointerId) return;
  n.preventDefault();
  const t = P, e = Et(n);
  P = null, e && t.fen === Ne() && Ae.toggle(t.fen, t.from, e, t.color), ee.hasPointerCapture(n.pointerId) && ee.releasePointerCapture(n.pointerId), ue();
});
ee.addEventListener("pointercancel", () => {
  P = null, ue();
});
ee.addEventListener("lostpointercapture", () => {
  P && (P = null, ue());
});
c("open-settings").addEventListener("click", () => c("settings-dialog").showModal());
c("empty-settings").addEventListener("click", () => c("settings-dialog").showModal());
c("close-settings").addEventListener("click", () => c("settings-dialog").close());
c("simulation-analyze").addEventListener("click", () => {
  _ && !O && (ve.delete(_.chess.fen()), be.clear(), Ye(), te(), ln());
});
c("play-suggestion").addEventListener("click", () => {
  if (!_ || O || !ce || _.pending) return;
  const n = ce;
  let t = _.move(n.slice(0, 2), n.slice(2, 4));
  t === "promotion" && (t = _.promote(n[4] || "q")), he(t);
});
document.querySelectorAll("[data-promotion]").forEach((n) => n.addEventListener("click", () => {
  _ && !O && he(_.promote(n.dataset.promotion));
}));
c("cancel-promotion").addEventListener("click", () => {
  _ && !O && (_.cancelPromotion(), he("selected"));
});
c("provider").addEventListener("change", () => {
  const n = c("provider").value;
  c("import-label").textContent = n === "pgn" ? "PGN 棋譜" : n === "lichess-game" ? "棋局連結或 8 碼 ID" : "玩家名稱", c("import-value").placeholder = n === "pgn" ? `[Event "..."]
...` : n === "lichess-game" ? "https://lichess.org/xxxxxxxx" : "例如：hikaru", c("import-value").value = "";
});
document.addEventListener("keydown", (n) => {
  var e;
  if (c("settings-dialog").open) return;
  if (n.key === "Escape") {
    hn();
    return;
  }
  if (n.ctrlKey || n.metaKey || n.altKey || ["INPUT", "TEXTAREA", "SELECT", "BUTTON", "SUMMARY", "A"].includes((e = document.activeElement) == null ? void 0 : e.tagName)) return;
  const t = { 1: -2, 2: -1, 3: 1, 4: 2 };
  n.key in t && (n.preventDefault(), un(t[n.key])), n.key === "Enter" && !c("next").disabled && (n.preventDefault(), ke());
});
setInterval(() => {
  if (We && !X && !G) {
    const n = Math.floor((Date.now() - We) / 1e3);
    c("timer").textContent = `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
  }
}, 1e3);
window.addEventListener("pagehide", () => {
  Ve.cancel(), Ge.cancel();
});
c("elo-min").value = V.min ?? "";
c("elo-max").value = V.max ?? "";
vt();
ke();
