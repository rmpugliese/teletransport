function centerHead() {
    sliderpan.noUiSlider.set(50), slidertilt.noUiSlider.set(50), window.realtime.robot.tilt(50), window.realtime.robot.pan(50);
}
function tiltDown() {
    !keySendAllowed && Math.floor(slidertilt.noUiSlider.get()) + 1 <= 100
        ? (slidertilt.noUiSlider.set(Math.floor(slidertilt.noUiSlider.get()) + 1), interval_tilt > 20 && (interval_tilt--, clearInterval(interv), (interv = setInterval(tiltDown, interval_tilt))))
        : (clearInterval(interv), (inclinaison = parseInt(slidertilt.noUiSlider.get())), window.realtime.robot.tilt(inclinaison));
}
function tiltUp() {
    !keySendAllowed && Math.floor(slidertilt.noUiSlider.get()) - 1 >= 0
        ? (slidertilt.noUiSlider.set(Math.floor(slidertilt.noUiSlider.get()) - 1), interval_tilt > 20 && (interval_tilt--, clearInterval(interv), (interv = setInterval(tiltUp, interval_tilt))))
        : (clearInterval(interv), (inclinaison = parseInt(slidertilt.noUiSlider.get())), window.realtime.robot.tilt(inclinaison));
}
function panRight() {
    !keySendAllowed && Math.floor(sliderpan.noUiSlider.get()) + 1 <= 100
        ? (sliderpan.noUiSlider.set(Math.floor(sliderpan.noUiSlider.get()) + 1), interval_pan > 20 && (interval_pan--, clearInterval(interv), (interv = setInterval(panRight, interval_pan))))
        : (clearInterval(interv), (angle = parseInt(sliderpan.noUiSlider.get())), window.realtime.robot.pan(angle));
}
function panLeft() {
    !keySendAllowed && Math.floor(sliderpan.noUiSlider.get()) - 1 >= 0
        ? (sliderpan.noUiSlider.set(Math.floor(sliderpan.noUiSlider.get()) - 1), interval_pan > 20 && (interval_pan--, clearInterval(interv), (interv = setInterval(panLeft, interval_pan))))
        : (clearInterval(interv), (angle = parseInt(sliderpan.noUiSlider.get())), window.realtime.robot.pan(angle));
}
(function () {
    window.realtime = {};
}.call(this),
    function () {
        var e;
        (e = (function () {
            function e() {}
            var t, o, n, i, a, l, r, s, c, d, u, p, f, w, m, g, v, h, b, _;
            return (
                (_ = null),
                (t = !1),
                (r = 0),
                (h = 0),
                (o = !0),
                (n = !1),
                (s = function () {
                    //INIZIO MOD >>>>>>>
                    return $.ajax({
                        url: "/ubbo/json/is_booking_mandatory.json",
                        type: "GET",
                        success: function (e) {
                            return (n = e.booking_mandatory), n ? l() : void 0;
                        },
                    });/*
                    return $.ajax({
                        url: "/pls/root/double_robotics.is_booking_mandatory",
                        type: "GET",
                        success: function (e) {
                            return (n = e.booking_mandatory), n ? l() : void 0;
                        },
                    });*/
                    //FINE MOD <<<<<<<
                }),
                (l = function () {
                    return h && clearInterval(h), console.log("refreshStatusLoop");
                }),
                (v = function (e) {
                    //INIZIO MOD >>>>>>>
                    return $.ajax({
                        url: "/ubbo/json/realtime_otp.json",
                        type: "GET",
                        success: function (t) {
                            return e(t.access_id, t.otp);
                        },
                        error: function () {
                            return u();
                        },
                    });
                    /*
                    return $.ajax({
                        url: "/pls/root/double_robotics.realtime_otp",
                        type: "GET",
                        success: function (t) {
                            return e(t.access_id, t.otp);
                        },
                        error: function () {
                            return u();
                        },
                    });*/
                    //FINE MOD <<<<<<<
                }),
                (p = function (e, t) {
                    return (
                        console.log("robotstatus before : " + t + " for : " + e),
                        n
                            ? $.ajax({
                                  url: "/check_for_booking?robot_id=" + e + "&robot_status=" + t,
                                  type: "GET",
                                  success: function (e) {
                                      return f(e.robot_id, e.robot_status);
                                  },
                                  error: function () {
                                      return f(e, t);
                                  },
                              })
                            : f(e, t)
                    );
                }),
                (f = function (e, t) {
                    return (
                        console.log("robotstatus : " + t + " for : " + e),
                        $("#robot-" + e).length
                            ? $("#robot-" + e + " .list-group-item-text").each(function () {
                                  var o;
                                  return (
                                      $(this).hasClass(t) ? $(this).show() : $(this).hide(),
                                      "connected" !== t || $("#robot-" + e + " .row-content a.call").length
                                          ? "connected" !== t && $("#robot-" + e + " a.call").length
                                              ? ($("#robot-" + e + " .row-picture").unwrap(),
                                                $("#robot-" + e + " .row-content .content h4").unwrap(),
                                                $("#robot-" + e + " a.call").off("click"),
                                                $("#robot-" + e + " .row-content .content .material-icons").hide())
                                              : void 0
                                          : ((o = '<a class="call" data-original-title=' + I18n.t("robots.call.help.clicktocall") + ' data-placement="top" data-toggle="tooltip" href="javascript:void(0)" title=""></a>'),
                                            $("#robot-" + e + " .row-picture").wrap(o),
                                            $("#robot-" + e + " .row-content .content h4").wrap(o),
                                            $("#robot-" + e + " .row-content .content .material-icons").show(),
                                            $("#robot-" + e + " a.call").click(function () {
                                                return g(e);
                                            }),
                                            $("body").tooltip({ selector: "[data-toggle=tooltip]" }))
                                  );
                              })
                            : void 0
                    );
                }),
                (b = function (e) {
                    return (
                        console.log("setAllRobotStatus : " + e),
                        $(".list-group .robot").each(function () {
                            return p($(this).attr("id").split("robot-").pop(), e);
                        })
                    );
                }),
                (d = function (e, t, o) {
                    return $.ajax({
                        url: "/robots/" + e + "/incoming_call?session_id=" + t + "&token=" + o,
                        type: "GET",
                        success: function (o) {
                            var n;
                            return (
                                $(".modal-backdrop").remove(),
                                $("#incoming-call-popup").replaceWith(o),
                                $("#incoming-call-popup").data("sessionId", t),
                                $("#refuse-call").on("click", function () {
                                    m(e);
                                }),
                                $("#incoming-call-popup").modal("show"),
                                $("#incoming-call-popup").on("hidden.bs.modal", function (e) {
                                    var t;
                                    return null != (t = $("audio#ring")[0]) ? t.pause() : void 0;
                                }),
                                null != (n = $("audio#ring")[0]) && n.play(),
                                setTimeout(function () {
                                    return $("#incoming-call-popup").data("sessionId") === t && $("#incoming-call-popup").modal("hide"), "visible" === $("#incoming-call-popup").css("visibility") ? c(e) : void 0;
                                }, 3e4)
                            );
                        },
                    });
                }),
                (w = function () {
                    return t ? _.emit("status:peers") : void 0;
                }),
                (g = function (e) {
                    return t ? _.emit("call:start", { peerId: e }) : void 0;
                }),
                (a = function (e) {
                    return _.emit("call:end", { peerId: e, reason: "end" });
                }),
                (m = function (e) {
                    return _.emit("call:end", { peerId: e, reason: "refused" });
                }),
                (c = function (e) {
                    return _.emit("call:end", { peerId: e, reason: "noanswer" });
                }),
                (u = function () {
                    return (
                        console.log("socket lost"),
                        o
                            ? (b("waiting_network"),
                              r && clearInterval(r),
                              (r = setInterval(function () {
                                  return console.log("socket reconnecting"), clearInterval(r), v(i);
                              }, 2e3)))
                            : void 0
                    );
                }),
                (i = function (e, n) {
                    var i;
                    return (
                        (i = ENV.UBBO_REALTIME_SERVER),
                        (_ = io.connect(i, { reconnection: !1, multiplex: !1, query: { accessId: e, otp: n } })),
                        console.log("socket trying to connect"),
                        _.on("status:authenticated", function () {
                            return (t = !0), w();
                        }),
                        _.on("status:RobotConnected", function (e) {
                            return p(e.id, "connected");
                        }),
                        _.on("status:RobotDisconnected", function (e) {
                            return console.log("status:RobotDisconnected"), p(e.id, "disconnected");
                        }),
                        _.on("status:RobotOnCall", function (e) {
                            return p(e.id, "on_call");
                        }),
                        _.on("status:peers", function (e) {
                            var t, o, n;
                            o = [];
                            for (t in e) (n = e[t]), o.push(p(t, n));
                            return o;
                        }),
                        _.on("call:incoming", function (e) {
                            return d(e.peerId, e.sessionId, e.token);
                        }),
                        _.on("call:sessionCreated", function (e) {
                            var t;

                            //INIZIO MOD >>>>>>>
                            window.realtime.call.init(ROBOT_ID, e.sessionId, e.token, "false");
                            return;
                            //FINE MOD <<<<<<<

                            return (t = { session_id: e.sessionId, token: e.token }), Turbolinks.visit("/robots/" + e.peerId + "/call?" + $.param(t));
                        }),
                        _.on("disconnect", function () {
                            return u();
                        }),
                        _.on("error", function () {
                            return u();
                        }),
                        _.on("connect_error", function () {
                            return u();
                        }),
                        _.on("connect_timeout", function () {
                            return u();
                        }),
                        _.on("connect", function () {
                            return console.log("socket connected");
                        }),
                        _.on("peer:alreadyConnected", function () {
                            return console.log("Peer already connected"), b("empty"), (o = !1), toastr.warning(I18n.t("robots.call.help.deconnected"), I18n.t("robots.call.help.deconnection"), { timeOut: 0 });
                        })
                    );
                }),
                (e.prototype.init = function () {
                    return (
                        v(i),
                        s(),
                        (o = !0),
                        $(window).on("pilots:refresh", function (e, t) {
                            return _.emit("pilots:refresh", { robotId: t });
                        })
                    );
                }),
                (e.prototype.refreshStatus = w),
                (e.prototype.endCall = a),
                e
            );
        })()),
            (window.realtime.status = new e()),
            window.realtime.status.init();
    }.call(this),
    (window.realtime.call = (function () {
        $(window).on("popstate", function (e) {
            event.state && (document.location.search.substr(1) ? window.history.go(-1) : u());
        });
        var e,
            t,
            o,
            n = "initial",
            i = !1,
            a = function () {
                if ("undefined" == typeof toastr) throw new Error("Error while loading toastr");
                toastr.options = { progressBar: !0, newestOnTop: !0 };
            },
            l = function (e, t, o, n) {
                if ("undefined" == typeof t) throw new Error("Invalid peedId");
                return new Peer({
                    peerId: e,
                    sessionId: t,
                    token: o,
                    api_key: ENV.OPENTOK_API_KEY,
                    local_video: "#local-video",
                    remote_video: "#remote-video",
                    remote_video_bottom: "#remote-video-bottom",
                    remote_audio: "#remote-audio",
                    audio_only: n,
                });
            },
            r = function (r, s, c, u) {
                if (
                    (console.log("Init call"),
                    (o = new Date().getTime()),
                    (t = setInterval(function () {
                        e.send_signal("signal_ping", {}),
                            o < new Date().getTime() - 3e4 &&
                                (console.log("Ping timedout"),
                                toastr.error(I18n.t("robots.call.help.nosignal"), I18n.t("robots.call.help.callended"), { timeout: 0 }),
                                (n = "disconnected"),
                                d(),
                                e.endCall(),
                                window.realtime.call.data.terminate(),
                                //INIZIO MOD >>>>>>>
                                (console.log('window.location.href = "/robots"')));
                                //(window.location.href = "/robots"));
                                //FINE MOD <<<<<<<
                    }, 2e3)),
                    "initial" == n)
                ) {
                    if (
                        ($(window).on("signal:ping", function (e, t) {
                            console.log("Received ping"), (o = new Date().getTime());
                        }),
                        $(window).on("signal:wifiStatus", function (e, t) {
                            isset(t.dataType) &&
                                "wifiSwitch" == t.dataType &&
                                isset(t.value) &&
                                "start" == t.value &&
                                (toastr.info(I18n.t("robots.call.help.wifiswitcherstart"), I18n.t("robots.call.help.wifiswitcher"), { timeOut: 4e3 }), (i = !0));
                        }),
                        a(),
                        window.realtime.call.settings.init(),
                        window.realtime.call.controls.ui.init(),
                        (r = $("#robot-id").text().trim()),
                        "number" != typeof Number(r))
                    )
                        throw new Error("Unvalid robot id " + r);
                    e = l(r, s, c, u);
                }
            };
        $(window).on("connection:created", function () {
            (i = !1), (n = "connected"), window.realtime.robot.init(e), window.realtime.call.data.init(e), c();
        }),
            $(window).on("stream:created", function (e, t) {}),
            $(window).on("stream:destroyed", function () {
                "disconnected" != n &&
                    (i ||
                        ((n = "disconnected"),
                        toastr.error(I18n.t("robots.call.help.robotdeconnected"), I18n.t("robots.call.help.callended"), { timeOut: 0 }),
                        d(),
                        e.endCall(),
                        window.realtime.call.data.terminate(),
                        //INIZIO MOD >>>>>>>
                        (goBackToResourceBooking())));
                        //(window.location.href = "/robots")));
                        //FINE MOD <<<<<<<
            }),
            $(window).on("session:disconnected", function () {
                toastr.error(I18n.t("robots.call.help.sessionended"), I18n.t("robots.call.help.callended"), { timeOut: 0 }), (n = "disconnected"), d(), e.endCall(), window.realtime.call.data.terminate(), (window.location.href = "/robots");
            });
        var s = function (e) {
                //INIZIO MOD >>>>>>>
                //(rid = $("#robot-id").text().trim()), (stats_data = { robot_id: rid, tag: e }), $.ajax({ type: "POST", dataType: "json", url: "/statline", data: stats_data });
                //FINE MOD <<<<<<<
            },
            c = function () {
                window.realtime.call.ui.onCall(), window.realtime.call.controls.ui.onCall(), window.realtime.call.controls.keyboard.init(), window.realtime.call.controls.touch.init(), s("START");
            },
            d = function () {
                window.realtime.call.controls.keyboard.terminate(), window.realtime.call.controls.touch.terminate(), window.realtime.call.controls.ui.offCall(), window.realtime.call.controls.gamepad.terminate(), clearInterval(t), s("STOP");
            },
            u = function () {
                console.log("------------------- EndCall"),
                    "connected" == n
                        ? (d(),
                          e.endCall(),
                          window.realtime.call.data.terminate(),
                          (n = "endRequested"),
                          setTimeout(function () {
                              //INIZIO MOD >>>>>>>
                              goBackToResourceBooking();
                              //window.location.href = "/robots";
                              //FINE MOD <<<<<<<
                          }, 500))
                        : setTimeout(function () {
                              location.reload(!0);
                          }, 500);
            },
            p = function () {
                "undefined" != typeof e && e.reload();
            };
        return (
            (window.isset = function (e) {
                return "undefined" != typeof e && null !== e && "" !== e;
            }),
            { init: r, status: n, endCall: u, reload: p }
        );
    })()),
    (window.realtime.call.ui = (function () {
        function e() {
            function e(e) {
                $("#local_stream").width(Math.round(($(window).width() * e) / 100)), $("#local_stream").height(Math.round(($(window).width() * o * e) / 100));
            }
            function t() {
                $(window).width() <= 768 && e(30);
            }
            var o = 0.75;
            $(window).resize(function () {
                t();
            }),
                t();
        }
        function t() {
            e();
        }
        return { onCall: t };
    })()),
    (window.realtime.call.controls = {}));
var keySendAllowed = !0,
    interv,
    interval_tilt,
    interval_pan,
    interval_max = 50,
    joystickBackRadius,
    set_joystick = function (e, t, o) {
        (angle = t),
            $("#joystick .front")
                .stop(!0, !1)
                .animate({ top: -e * Math.sin((angle * Math.PI) / 180), left: e * Math.cos((angle * Math.PI) / 180) }, 200, function () {
                    o && window.realtime.robot.directionchange(angle);
                });
    },
    get_joystick_position = function () {
        (null == joystickBackRadius || 0 == joystickBackRadius) && (joystickBackRadius = $("#joystick .back").width() / 2);
    };
(window.realtime.call.controls.keyboard = (function () {
    var t = -1,
        o = -1,
        n = 0,
        i = {
            BACKSPACE: 8,
            TAB: 9,
            ENTER: 13,
            SHIFT: 16,
            CTRL: 17,
            ALT: 18,
            PAUSE: 19,
            CAPS_LOCK: 20,
            ESCAPE: 27,
            SPACE: 32,
            PAGE_UP: 33,
            PAGE_DOWN: 34,
            END: 35,
            HOME: 36,
            LEFT_ARROW: 37,
            UP_ARROW: 38,
            RIGHT_ARROW: 39,
            DOWN_ARROW: 40,
            INSERT: 45,
            DELETE: 46,
            KEY_0: 48,
            KEY_1: 49,
            KEY_2: 50,
            KEY_3: 51,
            KEY_4: 52,
            KEY_5: 53,
            KEY_6: 54,
            KEY_7: 55,
            KEY_8: 56,
            KEY_9: 57,
            KEY_A: 65,
            KEY_B: 66,
            KEY_C: 67,
            KEY_D: 68,
            KEY_E: 69,
            KEY_F: 70,
            KEY_G: 71,
            KEY_H: 72,
            KEY_I: 73,
            KEY_J: 74,
            KEY_K: 75,
            KEY_L: 76,
            KEY_M: 77,
            KEY_N: 78,
            KEY_O: 79,
            KEY_P: 80,
            KEY_Q: 81,
            KEY_R: 82,
            KEY_S: 83,
            KEY_T: 84,
            KEY_U: 85,
            KEY_V: 86,
            KEY_W: 87,
            KEY_X: 88,
            KEY_Y: 89,
            KEY_Z: 90,
            LEFT_META: 91,
            RIGHT_META: 92,
            SELECT: 93,
            NUMPAD_0: 96,
            NUMPAD_1: 97,
            NUMPAD_2: 98,
            NUMPAD_3: 99,
            NUMPAD_4: 100,
            NUMPAD_5: 101,
            NUMPAD_6: 102,
            NUMPAD_7: 103,
            NUMPAD_8: 104,
            NUMPAD_9: 105,
            MULTIPLY: 106,
            ADD: 107,
            SUBTRACT: 109,
            DECIMAL: 110,
            DIVIDE: 111,
            F1: 112,
            F2: 113,
            F3: 114,
            F4: 115,
            F5: 116,
            F6: 117,
            F7: 118,
            F8: 119,
            F9: 120,
            F10: 121,
            F11: 122,
            F12: 123,
            NUM_LOCK: 144,
            SCROLL_LOCK: 145,
            SEMICOLON: 186,
            EQUALS: 187,
            COMMA: 188,
            DASH: 189,
            PERIOD: 190,
            FORWARD_SLASH: 191,
            GRAVE_ACCENT: 192,
            OPEN_BRACKET: 219,
            BACK_SLASH: 220,
            CLOSE_BRACKET: 221,
            SINGLE_QUOTE: 222,
        },
        a = [i.UP_ARROW, i.DOWN_ARROW, i.LEFT_ARROW, i.RIGHT_ARROW],
        l = [
            i.KEY_A,
            i.KEY_Z,
            i.KEY_C,
            i.KEY_D,
            i.KEY_E,
            i.KEY_Q,
            i.KEY_S,
            i.KEY_W,
            i.KEY_X,
            i.NUMPAD_1,
            i.NUMPAD_2,
            i.NUMPAD_3,
            i.NUMPAD_4,
            i.NUMPAD_5,
            i.NUMPAD_6,
            i.NUMPAD_7,
            i.NUMPAD_8,
            i.NUMPAD_9,
            i.UP_ARROW,
            i.DOWN_ARROW,
            i.LEFT_ARROW,
            i.RIGHT_ARROW,
            i.SPACE,
        ],
        r = function (e) {
            for (keyKey in l) e.keyCode == l[keyKey] && window.realtime.robot.stop();
            set_joystick(0, 0, !1);
        },
        s = !1,
        c = function (e) {
            get_joystick_position(),
                e.keyCode == i.SPACE && centerHead(),
                (e.keyCode == i.KEY_Z || e.keyCode == i.NUMPAD_8) && window.realtime.robot.forward(),
                (e.keyCode == i.KEY_X || e.keyCode == i.NUMPAD_2) && window.realtime.robot.backward(),
                (e.keyCode == i.KEY_Q || e.keyCode == i.NUMPAD_4) && window.realtime.robot.selfRotate("left"),
                (e.keyCode == i.KEY_D || e.keyCode == i.NUMPAD_6) && window.realtime.robot.selfRotate("right"),
                (e.keyCode == i.KEY_S || e.keyCode == i.NUMPAD_5) && window.realtime.robot.stop(),
                e.keyCode == i.DOWN_ARROW &&
                    (s
                        ? Math.floor(slidertilt.noUiSlider.get()) + 1 <= 100 &&
                          (slidertilt.noUiSlider.set(Math.floor(slidertilt.noUiSlider.get()) + 1), clearInterval(interv), (interval_tilt = interval_max), (interv = setInterval(tiltDown, interval_tilt)))
                        : (set_joystick(joystickBackRadius, 270, !1), (o = i.DOWN_ARROW), (t = -1), (n = 0), window.realtime.robot.backward())),
                e.keyCode == i.UP_ARROW &&
                    (s
                        ? Math.floor(slidertilt.noUiSlider.get()) - 1 >= 0 &&
                          (slidertilt.noUiSlider.set(Math.floor(slidertilt.noUiSlider.get()) - 1), clearInterval(interv), (interval_tilt = interval_max), (interv = setInterval(tiltUp, interval_tilt)))
                        : (set_joystick(joystickBackRadius, 90, !1), (o = i.UP_ARROW), (t = -1), (n = 0), window.realtime.robot.forward())),
                e.keyCode == i.RIGHT_ARROW &&
                    (s
                        ? Math.floor(sliderpan.noUiSlider.get()) + 1 <= 100 &&
                          (sliderpan.noUiSlider.set(Math.floor(sliderpan.noUiSlider.get()) + 1), clearInterval(interv), (interval_pan = interval_max), (interv = setInterval(panRight, interval_pan)))
                        : (set_joystick(joystickBackRadius, 0, !1), (o = i.RIGHT_ARROW), (t = -1), (n = 0), window.realtime.robot.selfRotate("right"))),
                e.keyCode == i.LEFT_ARROW &&
                    (s
                        ? Math.floor(sliderpan.noUiSlider.get()) - 1 >= 0 &&
                          (sliderpan.noUiSlider.set(Math.floor(sliderpan.noUiSlider.get()) - 1), clearInterval(interv), (interval_pan = interval_max), (interv = setInterval(panLeft, interval_pan)))
                        : (set_joystick(joystickBackRadius, 180, !1), (o = i.LEFT_ARROW), (t = -1), (n = 0), window.realtime.robot.selfRotate("left")));
        },
        d = function (e) {
            (t = e),
                o == i.UP_ARROW && (-1 == t && set_joystick(joystickBackRadius, 90, !0), t == i.LEFT_ARROW && set_joystick(joystickBackRadius, 135, !0), t == i.RIGHT_ARROW && set_joystick(joystickBackRadius, 45, !0)),
                o == i.DOWN_ARROW && (-1 == t && set_joystick(joystickBackRadius, 270, !0), t == i.LEFT_ARROW && set_joystick(joystickBackRadius, 225, !0), t == i.RIGHT_ARROW && set_joystick(joystickBackRadius, 315, !0)),
                o == i.LEFT_ARROW && (-1 == t && set_joystick(joystickBackRadius, 180, !0), t == i.UP_ARROW && set_joystick(joystickBackRadius, 135, !0), t == i.DOWN_ARROW && set_joystick(joystickBackRadius, 225, !0)),
                o == i.RIGHT_ARROW && (-1 == t && set_joystick(joystickBackRadius, 0, !0), t == i.UP_ARROW && set_joystick(joystickBackRadius, 45, !0), t == i.DOWN_ARROW && set_joystick(joystickBackRadius, 315, !0));
        },
        u = function () {
            $(window).on("blur", function () {
                window.realtime.robot.stop();
                var t = [i.UP_ARROW, i.LEFT_ARROW, i.RIGHT_ARROW, i.DOWN_ARROW, i.CTRL];
                for (var o in t) (e = $.Event("keyup")), (e.keyCode = o), $("input").trigger(e);
            }),
                $(window).on("keydown", function (e) {
                    return e.keyCode == i.CTRL ? void (s = !0) : (0 == s && a.includes(e.keyCode) && t != e.keyCode && o != e.keyCode && d(e.keyCode), void (keySendAllowed && (c(e), (keySendAllowed = !1))));
                }),
                $(window).on("keyup", function (e) {
                    return e.keyCode == i.CTRL ? void (s = !1) : 0 == s && e.keyCode == t ? void d(-1) : 0 == s && e.keyCode == o && -1 != t ? ((o = t), void d(-1)) : (r(e), (o = -1), void (keySendAllowed = !0));
                });
        },
        p = function () {
            $(window).off("keydown"), $(window).off("keyup");
        };
    return { init: u, terminate: p };
})()),
    (window.realtime.call.controls.touch = (function () {
        var e,
            t,
            o,
            n = function () {
                if ($(window).width() < 768)
                    var e = { left: "70%", top: "75%" },
                        t = 75;
                else if ($(window).width() < 1024)
                    var e = { left: "80%", top: "86%" },
                        t = 75;
                else if ($(window).width() < 1025)
                    var e = { left: "80%", top: "80%" },
                        t = 100;
                else
                    var e = { left: "80%", top: "80%" },
                        t = 150;
                var e = { left: "50%", top: "50%" },
                    o = nipplejs.create({ zone: document.getElementById("joystick-inner"), mode: "static", position: e, color: "#439bb9", size: t, restOpacity: 1 }),
                    n = 1e3,
                    i = 10;
                o.on("move", function (e, o) {
                    if ("object" == typeof o.angle) {
                        var a,
                            l = parseInt(o.angle.degree);
                        "object" == typeof o.direction && (direction = o.direction.angle),
                            (distanceFromCenter = parseInt((100 * o.distance) / (t / 2))),
                            distanceFromCenter > 50 && Math.abs(l - n) >= i && ((n = l), l >= 0 && 180 >= l ? ((a = "forward"), window.realtime.robot.move(a, l)) : ((a = "backward"), (l -= 180), window.realtime.robot.move(a, l)));
                    }
                }),
                    o.on("end", function (e, t) {
                        window.realtime.robot.stop(), (n = 1e3);
                    });
            },
            i = function () {
                function e(e) {
                    window.realtime.robot.tilt(e);
                }
                if ("undefined" == typeof noUiSlider) throw new Error("Error while loading noUiSlider");
                var o = 50;
                (t = document.getElementById("slidertilt")),
                    noUiSlider.create(t, { start: o, connect: "lower", orientation: "vertical", range: { min: 0, max: 100 }, direction: "ltr" }),
                    t.noUiSlider.on("change", function () {
                        (inclinaison = parseInt(t.noUiSlider.get())), e(inclinaison);
                    });
            },
            a = function () {
                function e(e) {
                    window.realtime.robot.pan(e);
                }
                if ("undefined" == typeof noUiSlider) throw new Error("Error while loading noUiSlider");
                var t = 50;
                (o = document.getElementById("sliderpan")),
                    noUiSlider.create(o, { start: t, connect: "upper", orientation: "horizontal", range: { min: 0, max: 100 }, direction: "ltr" }),
                    o.noUiSlider.on("change", function () {
                        (angle = parseInt(o.noUiSlider.get())), e(angle);
                    });
            },
            l = function () {
                function e(e) {
                    window.realtime.robot.translate(e);
                }
                function t() {
                    window.realtime.robot.stop();
                }
                $(".translate").on("mousedown touchstart", function (t) {
                    t.preventDefault(), $(this).addClass("active"), e($(this).attr("data-dir"));
                }),
                    $(".translate").on("mouseup mouseleave touchend", function (e) {
                        e.preventDefault(), $(this).removeClass("active"), t();
                    });
            },
            r = function () {
                n(), l(), i(), a();
            },
            s = function () {
                isset(e) && e.off(), $(".translate").off(), isset(t) && (t.innerHTML = "");
            };
        return {
            init: r,
            terminate: s,
            setSliderTilt: function (e) {
                isset(t.noUiSlider) && t.noUiSlider.set(e);
            },
            setSliderPan: function (e) {
                isset(o.noUiSlider) && o.noUiSlider.set(e);
            },
        };
    })()),
    (window.realtime.call.controls.gamepad = (function () {
        var t,
            o = null,
            n = null,
            i = {},
            a = null,
            l = { BUTTON_1: 0, BUTTON_2: 1, BUTTON_3: 2, BUTTON_4: 3, BUTTON_L1: 4, BUTTON_R1: 5, BUTTON_L2: 6, BUTTON_R2: 7, SELECT: 8, START: 9, STICK_1: 10, STICK_2: 11, BUTTON_11: 13, BUTTON_12: 15, BUTTON_13: 14, BUTTON_14: 12 },
            r = { BUTTON_1: 0, BUTTON_2: 1, BUTTON_3: 2, BUTTON_4: 3, BUTTON_L1: 4, BUTTON_R1: 5, BUTTON_L2: 6, BUTTON_R2: 7, SELECT: 8, START: 9, STICK_1: 10, STICK_2: 11, BUTTON_11: 13, BUTTON_12: 15, BUTTON_13: 14, BUTTON_14: 12 },
            s = { LEFT_X: 0, LEFT_Y: 1, RIGHT_X: 2, RIGHT_Y: 3 },
            c = { axisThreshold: 0, indices: { standard: { cursorX: 2, cursorY: 3, scrollX: 0, scrollY: 1, back: 9, forward: 8, vendor: 10, zoomIn: 5, zoomOut: 1 } } },
            d = function () {
                n ||
                    ((n = new Gamepads(c)),
                    (n.polling = !1),
                    (n.updateStatus = function () {
                        (n.polling = !0), n.update(), window.requestAnimationFrame(n.updateStatus);
                    }),
                    (n.cancelLoop = function () {
                        (n.polling = !1), n.pollingInterval && window.clearInterval(n.pollingInterval), window.cancelAnimationFrame(n.updateStatus);
                    }));
            },
            u = function (e, t) {
                i[e] = t;
            },
            p = function (e, o) {
                get_joystick_position(),
                    isset(e) &&
                        (console.log("button==" + e.id),
                        console.log("actualButtons.BUTTON_R2=" + t.BUTTON_R2),
                        console.log("actualButtons.BUTTON_R1=" + t.BUTTON_R1),
                        e.id == t.BUTTON_R2 || e.id == t.BUTTON_R1
                            ? (console.log("actualButtons=" + e.id), 1 == e.value && (console.log("centerHead"), centerHead()))
                            : e.id == t.BUTTON_1
                            ? Math.floor(slidertilt.noUiSlider.get()) + 1 <= 100 &&
                              1 == e.value &&
                              (slidertilt.noUiSlider.set(Math.floor(slidertilt.noUiSlider.get()) + 1), clearInterval(interv), (interval_tilt = interval_max), (interv = setInterval(tiltDown, interval_tilt)))
                            : e.id == t.BUTTON_4
                            ? 1 == e.value &&
                              Math.floor(slidertilt.noUiSlider.get()) - 1 >= 0 &&
                              (slidertilt.noUiSlider.set(Math.floor(slidertilt.noUiSlider.get()) - 1), clearInterval(interv), (interval_tilt = interval_max), (interv = setInterval(tiltUp, interval_tilt)))
                            : e.id == t.BUTTON_2
                            ? 1 == e.value &&
                              Math.floor(sliderpan.noUiSlider.get()) + 1 <= 100 &&
                              (sliderpan.noUiSlider.set(Math.floor(sliderpan.noUiSlider.get()) + 1), clearInterval(interv), (interval_pan = interval_max), (interv = setInterval(panRight, interval_pan)))
                            : e.id == t.BUTTON_3
                            ? 1 == e.value &&
                              Math.floor(sliderpan.noUiSlider.get()) - 1 >= 0 &&
                              (sliderpan.noUiSlider.set(Math.floor(sliderpan.noUiSlider.get()) - 1), clearInterval(interv), (interval_pan = interval_max), (interv = setInterval(panLeft, interval_pan)))
                            : e.id == t.BUTTON_14
                            ? 1 == e.value
                                ? (window.realtime.robot.forward(), set_joystick(joystickBackRadius, 90, !1))
                                : (window.realtime.robot.stop(), set_joystick(0, 0, !1))
                            : e.id == t.BUTTON_11
                            ? 1 == e.value
                                ? (window.realtime.robot.backward(), set_joystick(joystickBackRadius, 270, !1))
                                : (window.realtime.robot.stop(), set_joystick(0, 0, !1))
                            : e.id == t.BUTTON_12
                            ? 1 == e.value
                                ? (window.realtime.robot.selfRotate("right"), set_joystick(joystickBackRadius, 0, !1))
                                : (window.realtime.robot.stop(), set_joystick(0, 0, !1))
                            : e.id == t.BUTTON_13 && (1 == e.value ? (window.realtime.robot.selfRotate("left"), set_joystick(joystickBackRadius, 180, !1)) : (window.realtime.robot.stop(), set_joystick(0, 0, !1)))),
                    isset(o) &&
                        ((o.id == s.LEFT_X || o.id == s.LEFT_Y) &&
                            ((xpos = o.axes[s.LEFT_X]),
                            (ypos = o.axes[s.LEFT_Y]),
                            (mod = Math.sqrt(xpos * xpos + ypos * ypos)),
                            mod < 0.1
                                ? (window.realtime.robot.stop(), set_joystick(0, 0, !1), (a = "stop"))
                                : ((ang = Math.atan2(ypos, xpos) * (-180 / Math.PI)),
                                  set_joystick(joystickBackRadius, ang, !1),
                                  ang >= 0 && ang <= 180 ? ((movement = "forward"), window.realtime.robot.move(movement, angle)) : ((movement = "backward"), (angle -= 180), window.realtime.robot.move(movement, angle)))),
                        (o.id == s.RIGHT_X || o.id == s.RIGHT_Y) &&
                            ((xpos = o.axes[s.RIGHT_X]),
                            (ypos = o.axes[s.RIGHT_Y]),
                            (mod = Math.sqrt(xpos * xpos + ypos * ypos)),
                            mod > 0.1
                                ? ((keySendAllowed = !1),
                                  o.id == s.RIGHT_X
                                      ? xpos > 0
                                          ? Math.floor(sliderpan.noUiSlider.get()) + 1 <= 100 &&
                                            (sliderpan.noUiSlider.set(Math.floor(sliderpan.noUiSlider.get()) + 1), clearInterval(interv), (interval_pan = interval_max), (interv = setInterval(panRight, interval_pan)))
                                          : Math.floor(sliderpan.noUiSlider.get()) - 1 >= 0 &&
                                            (sliderpan.noUiSlider.set(Math.floor(sliderpan.noUiSlider.get()) - 1), clearInterval(interv), (interval_pan = interval_max), (interv = setInterval(panLeft, interval_pan)))
                                      : o.id == s.RIGHT_Y &&
                                        (ypos > 0
                                            ? (console.log("up"),
                                              Math.floor(slidertilt.noUiSlider.get()) + 1 <= 100 &&
                                                  (slidertilt.noUiSlider.set(Math.floor(slidertilt.noUiSlider.get()) + 1), clearInterval(interv), (interval_tilt = interval_max), (interv = setInterval(tiltDown, interval_tilt))))
                                            : (console.log("down"),
                                              Math.floor(slidertilt.noUiSlider.get()) - 1 >= 0 &&
                                                  (slidertilt.noUiSlider.set(Math.floor(slidertilt.noUiSlider.get()) - 1), clearInterval(interv), (interval_tilt = interval_max), (interv = setInterval(tiltUp, interval_tilt))))))
                                : (keySendAllowed = !0)));
            },
            f = function (t) {
                n &&
                    "number" == typeof Number(t) &&
                    ((o = t),
                    n.gamepadsSupported &&
                        ($(window).on("gamepadaxismove", function (o) {
                            (e = o.originalEvent), t == e.gamepad.index && p(null, { id: e.axis, value: e.value, axes: e.detail.gamepad.axes });
                        }),
                        $(window).on("gamepadbuttondown", function (o) {
                            (e = o.originalEvent), t == e.gamepad.index && ((keySendAllowed = !1), u(e.button, !0), p({ id: e.button, value: !0 }, null));
                        }),
                        $(window).on("gamepadbuttonup", function (o) {
                            (e = o.originalEvent), t == e.gamepad.index && ((keySendAllowed = !0), u(e.button, !1), p({ id: e.button, value: !1 }, null));
                        }),
                        n.updateStatus()));
            },
            w = function () {
                $(window).off("gamepadaxismove gamepadbuttondown gamepadbuttonup"), n && n.cancelLoop();
            },
            m = function (e) {
                t = "xinput" == e ? r : l;
            };
        return { init: d, begin: f, terminate: w, setxinput: m };
    })()),
    (window.realtime.call.controls.ui = (function () {
        var e = function () {
                $("#toggleHelp").magnificPopup({ type: "inline" }), $("#toggleSettings").magnificPopup({ type: "inline" }), $("#toggleLocation").magnificPopup({ type: "inline" });
            },
            t = function () {
                $(".on-call-controls").fadeIn(400).css("display", "inline-block");
            },
            o = function () {
                $(".on-call-controls").fadeOut(200);
            },
            n = function () {
                $(".call-controls").fadeOut(200, function () {
                    $(".pilotage .loading").removeClass("hide").hide().fadeIn();
                });
            },
            i = function () {
                $(".pilotage .loading").fadeOut(200, function () {
                    $(".call-controls").removeClass("hide").hide().fadeIn(200);
                });
            },
            a = function () {
                i(), t();
            },
            l = function () {
                o();
            },
            r = function () {
                $("#toggleDockstation").removeClass("hide");
            },
            s = function () {
                $("#zoomIn").css({ opacity: 1 });
            },
            c = function () {
                $("#zoomOut").css({ opacity: 1 });
            },
            d = function () {
                $("#zoomIn").css({ opacity: 0.2 });
            },
            u = function () {
                $("#zoomOut").css({ opacity: 0.2 });
            },
            p = function () {
                $("#volumeUp").css({ opacity: 1 });
            },
            f = function () {
                $("#volumeDown").css({ opacity: 1 });
            },
            w = function () {
                $("#volumeUp").css({ opacity: 0.2 });
            },
            m = function () {
                $("#volumeDown").css({ opacity: 0.2 });
            },
            g = function (e) {
                $("#robotSpeedSettings li").removeClass("active"), "1" == e && $("#speed_1").addClass("active"), "2" == e && $("#speed_2").addClass("active"), "3" == e && $("#speed_3").addClass("active");
            },
            v = function (e) {
                "false" == e ? $("#enableGamepad").prop("checked", !1) : $("#enableGamepad").prop("checked", !0);
            },
            h = function (e) {
                "false" == e ? $("#enableProx").prop("checked", !1) : $("#enableProx").prop("checked", !0);
            },
            b = function (e) {
                "false" == e ? $("#enableVacuum").prop("checked", !1) : $("#enableVacuum").prop("checked", !0);
            },
            _ = function () {
                e(),
                    i(),
                    $("#endCall").on("click touchstart", function (e) {
                        e.preventDefault(), window.realtime.call.endCall();
                    }),
                    $("#reload").on("click touchstart", function (e) {
                        e.preventDefault(), window.realtime.call.reload(), window.location.reload();
                    }),
                    $("#toggleDockstation").on("click touchstart", function (e) {
                        e.preventDefault(), toastr.success(I18n.t("robots.call.help.backtodockstation"), I18n.t("robots.call.help.dockstation"), { preventDuplicates: !0 }), window.realtime.robot.goToDockstation();
                    });
            };
        return {
            init: _,
            showCallControls: t,
            hideCallControls: o,
            onCall: a,
            offCall: l,
            displayDockstationButton: r,
            loading: n,
            enableZoomIn: s,
            enableZoomOut: c,
            disableZoomIn: d,
            disableZoomOut: u,
            enableVolumeUp: p,
            enableVolumeDown: f,
            disableVolumeUp: w,
            disableVolumeDown: m,
            enableProximitySensor: h,
            enableVacuumSensor: b,
            setRobotSpeed: g,
            setJoystickMode: v,
        };
    })()),
    (window.realtime.call.settings = (function () {
        var e = {},
            t = !1,
            o = null,
            n = function () {
                $("#enableProx").on("change", function () {
                    (isChecked = $(this).prop("checked")), Cookies.set("ubbo_proximitySensorActivated", isChecked), window.realtime.call.data.sendProximitySensorState(isChecked);
                });
            },
            i = function () {
                $("#enableVacuum").on("change", function () {
                    (isChecked = $(this).prop("checked")), Cookies.set("ubbo_vacuumSensorActivated", isChecked), window.realtime.call.data.sendVacuumSensorState(isChecked);
                });
            },
            a = function () {
                $("ul#robotSpeedSettings li").on("click", function () {
                    $("#robotSpeedSettings li").removeClass("active"), $(this).addClass("active");
                    var e = this.id.split("_").pop();
                    Cookies.set("ubbo_robotSpeedLevel", e), window.realtime.call.data.sendRobotSpeedLevel(e);
                });
            },
            l = function () {
                var e = Cookies.get("ubbo_activeGamepad");
                window.realtime.call.controls.ui.setJoystickMode(e),
                    "true" == e ? ((t = !0), (o = Cookies.get("ubbo_activeGamepad_index"))) : (t = !1),
                    t && null != o && (r(), window.realtime.call.controls.gamepad.init(), window.realtime.call.controls.gamepad.terminate(), window.realtime.call.controls.gamepad.begin(o)),
                    $("#enableGamepad").on("change", function () {
                        (t = $("#enableGamepad").prop("checked")),
                            Cookies.set("ubbo_activeGamepad", t),
                            0 == t
                                ? (Cookies.remove("ubbo_activeGamepad_index"), $("#gamepadListContainer").fadeOut(300), $("#gamepadListContainer .selectGamepad").off(), window.realtime.call.controls.gamepad.terminate())
                                : (r(), window.realtime.call.controls.gamepad.init());
                    }),
                    $(window).on("gamepadconnected gamepaddisconnected", r),
                    $(window).on("gamepadconnected", function (e) {
                        toastr.info(e.originalEvent.gamepad.id + " " + I18n.t("robots.call.help.gamepadhasbeenconnected"), I18n.t("robots.call.help.gamepadconnected")),
                            window.realtime.call.controls.gamepad.setxinput(e.originalEvent.gamepad.id);
                    }),
                    $(window).on("gamepaddisconnected", function (e) {
                        toastr.warning(I18n.t("robots.call.help.gamepadhasbeendisconnected"), I18n.t("robots.call.help.gamepaddisconnected"));
                    });
            },
            r = function () {
                if (t)
                    if (($("#gamepadListContainer").removeClass("hide").hide().fadeIn(400), "getGamepads" in navigator)) {
                        (e = navigator.getGamepads()), $("#gamepadList").empty();
                        var n = !0,
                            i = navigator.getGamepads()[0];
                        null != i &&
                            (console.log("Contr\xf4leur n\xb0%d connect\xe9 : %s. %d boutons, %d axes.", i.index, i.id, i.buttons.length, i.axes.length),
                            (n = !1),
                            $("<li/>")
                                .attr("class", o == i.index ? "active" : "")
                                .append($("<a/>").attr("class", "selectGamepad").html(i.id).data("id", i.index))
                                .appendTo("#gamepadList")),
                            n && $("<li/>").html(I18n.t("robots.call.help.nogamepad")).appendTo("#gamepadList"),
                            $("#gamepadListContainer .selectGamepad").off(),
                            $("#gamepadListContainer .selectGamepad").click(function (e) {
                                e.preventDefault();
                                var t = $(this).data("id");
                                "undefined" != typeof t && ((o = t), Cookies.set("ubbo_activeGamepad_index", o), s(), $("#gamepadListContainer li").removeClass("active"), $(this).parent().addClass("active"), $.magnificPopup.close());
                            });
                    } else $("#gamepadListContainer .browserCapable").hide(), $("#gamepadListContainer .browserNotCapable").removeClass("hide");
                else $("#gamepadListContainer").fadeOut(300), $("#gamepadListContainer .selectGamepad").off(), window.realtime.call.controls.gamepad.terminate();
            },
            s = function () {
                t && isset(o) && (window.realtime.call.controls.gamepad.terminate(), window.realtime.call.controls.gamepad.begin(o));
            },
            c = function (e) {
                var t = $(window).width(),
                    o = $(window).height(),
                    n = 0.75;
                switch (e) {
                    case "q100h":
                        t = o + o * n;
                        break;
                    case "q100w":
                        o = t * n;
                        break;
                    case "q75h":
                        (o = 0.75 * o), (t = o + o * n);
                        break;
                    case "q50h":
                        (o = 0.5 * o), (t = o + o * n);
                }
                t > $(window).width() && (t = $(window).width()), o > $(window).height() && (o = $(window).height()), $("#remote-video").width(Math.round(t)), $("#remote-video").height(Math.round(o));
            },
            d = function () {
                var e = "q100h";
                c(e),
                    $(window).resize(function () {
                        c(e);
                    }),
                    $("#remote-video").removeAttr("class"),
                    $("#videoQualitySettings .setvideoquality").click(function (t) {
                        t.preventDefault(), c($(this).attr("data-perc")), (e = $(this).attr("data-perc")), $("#videoQualitySettings li").removeClass("active"), $(this).parent().addClass("active"), $.magnificPopup.close();
                    });
            },
            u = function () {
                l(), n(), i(), a(), r(), s(), d(), (proxActivated = Cookies.get("ubbo_proximitySensorActivated")), "undefined" == typeof proxActivated && (proxActivated = !0), $("#toggleGamepadHelp").magnificPopup({ type: "inline" });
            };
        return { init: u };
    })()),
    (window.realtime.call.data = (function () {
        var e,
            t,
            o,
            n = !1,
            i = !1,
            a = !1,
            l = function () {
                i = !0;
            },
            r = function () {
                console.log("request location"), e.send_signal("requestData", { dataType: "location" });
            },
            s = !1,
            c = function () {
                $(window).on("signal:tabletData", function (e, o) {
                    if ((console.log(o), isset(o.dataType) && "wifi" == o.dataType && isset(o.speed))) {
                        wifi_strength = o.speed;
                        var i;
                        (i = wifi_strength >= 66 ? "success" : wifi_strength >= 33 ? "warning" : "danger"),
                            $("#wifiIcon i")
                                .removeClass("text-danger text-warning text-success fa-cog fa-spin")
                                .addClass("fa-wifi text-" + i)
                                .prop("title", "Wifi : " + wifi_strength + "% - " + I18n.t("robots.call.help.clicktorefresh")),
                            $("#wifiIcon a").attr("data-content", I18n.t("robots.call.help.wifiquality") + ": " + wifi_strength + "%"),
                            s || $("#wifiIcon").removeClass("hide").hide().fadeIn(800),
                            (s = !0);
                    }
                    if (
                        isset(o.dataType) &&
                        "location" == o.dataType &&
                        isset(o.latitude) &&
                        isset(o.longitude) &&
                        (n || ((n = !0), (t = L.map("locationMap"))),
                        $("#toggleLocation").removeClass("hide").hide().fadeIn(800),
                        t.setView([o.latitude, o.longitude], 13),
                        L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=" + ENV.MAP_MAPBOX_ACCESS_TOKEN, {
                            maxZoom: 18,
                            attribution:
                                'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery \xa9 <a href="https://www.mapbox.com/">Mapbox</a>',
                            id: "mapbox/streets-v11",
                        }).addTo(t),
                        L.marker([o.latitude, o.longitude]).addTo(t),
                        setTimeout(function () {
                            t.invalidateSize();
                        }, 100),
                        "" == $("#locationAddress").text())
                    ) {
                        var a = "https://open.mapquestapi.com/nominatim/v1/reverse.php?key=" + ENV.MAP_MAPQUEST + "&format=json&lat=" + o.latitude + "&lon=" + o.longitude;
                        $.getJSON(a, null, function (e) {
                            var t = "",
                                o = "";
                            void 0 !== e.address.road && (t = e.address.road),
                                void 0 !== e.address.city ? (o = e.address.city) : void 0 !== e.address.village && (o = e.address.village),
                                $("#locationAddress")
                                    .text(t + " " + o)
                                    .removeClass("hide")
                                    .hide()
                                    .fadeIn(200);
                        });
                    }
                }),
                    $("#centerhead").on("click touchstart", function (e) {
                        e.preventDefault(), sliderpan.noUiSlider.set(50), slidertilt.noUiSlider.set(50), window.realtime.robot.tilt(50), window.realtime.robot.pan(50);
                    }),
                    $("#zoomIn").on("click touchstart", function (e) {
                        e.preventDefault(), h();
                    }),
                    $("#zoomOut").on("click touchstart", function (e) {
                        e.preventDefault(), b();
                    }),
                    $("#volumeUp").on("click touchstart", function (e) {
                        e.preventDefault(), p();
                    }),
                    $("#volumeDown").on("click touchstart", function (e) {
                        e.preventDefault(), u();
                    }),
                    $("#toggleLight").on("click touchstart", function (e) {
                        e.preventDefault(),
                            1 == $("#toggleLight").css("opacity")
                                ? ($("#toggleLight").css({ opacity: 0.5 }), v())
                                : ($("#toggleLight").css({ opacity: 1 }), $("#toggleSmile").css({ opacity: 0.5 }), $("#toggleMeh").css({ opacity: 0.5 }), $("#toggleFrown").css({ opacity: 0.5 }), f());
                    }),
                    $("#toggleSmile").on("click touchstart", function (e) {
                        e.preventDefault(),
                            1 == $("#toggleSmile").css("opacity")
                                ? ($("#toggleSmile").css({ opacity: 0.5 }), v())
                                : ($("#toggleSmile").css({ opacity: 1 }), $("#toggleLight").css({ opacity: 0.5 }), $("#toggleMeh").css({ opacity: 0.5 }), $("#toggleFrown").css({ opacity: 0.5 }), w());
                    }),
                    $("#toggleMeh").on("click touchstart", function (e) {
                        e.preventDefault(),
                            1 == $("#toggleMeh").css("opacity")
                                ? ($("#toggleMeh").css({ opacity: 0.5 }), v())
                                : ($("#toggleMeh").css({ opacity: 1 }), $("#toggleLight").css({ opacity: 0.5 }), $("#toggleSmile").css({ opacity: 0.5 }), $("#toggleFrown").css({ opacity: 0.5 }), m());
                    }),
                    $("#toggleFrown").on("click touchstart", function (e) {
                        e.preventDefault(),
                            1 == $("#toggleFrown").css("opacity")
                                ? ($("#toggleFrown").css({ opacity: 0.5 }), v())
                                : ($("#toggleLight").css({ opacity: 0.5 }), $("#toggleFrown").css({ opacity: 1 }), $("#toggleSmile").css({ opacity: 0.5 }), $("#toggleMeh").css({ opacity: 0.5 }), g());
                    }),
                    $("#shareScreen").on("click touchstart", function (t) {
                        t.preventDefault(), e.share_user_screen("#shareScreen i");
                    }),
                    $("#wifiIcon").on("click touchstart", function (e) {
                        e.preventDefault(), d(), s && $("#wifiIcon i").removeClass("fa-wifi text-danger text-warning text-success fa-cog fa-spin").addClass("fa-cog fa-spin");
                    }),
                    $("#toggleLocation").on("click touchstart", function (e) {
                        console.log("ask request location"), e.preventDefault(), r();
                    });
            },
            d = function () {
                if ("undefined" == typeof e) throw new Error("Call not connected");
                e.send_signal("requestData", { dataType: "wifi" });
            },
            u = function () {
                if ("undefined" == typeof e) throw new Error("Call not connected");
                e.send_signal("requestData", { dataType: "volumeDown" });
            },
            p = function () {
                if ("undefined" == typeof e) throw new Error("Call not connected");
                e.send_signal("requestData", { dataType: "volumeUp" });
            },
            f = function () {
                if ("undefined" == typeof e) throw new Error("Call not connected");
                e.send_signal("requestData", { dataType: "lightOn" });
            },
            w = function () {
                if ("undefined" == typeof e) throw new Error("Call not connected");
                e.send_signal("requestData", { dataType: "emoticon", red: "0000000000000000", green: "3c42a581a599423c", blue: "0000000000000000" });
            },
            m = function () {
                if ("undefined" == typeof e) throw new Error("Call not connected");
                e.send_signal("requestData", { dataType: "emoticon", red: "3c42a5818199423c", green: "3c42a5818199423c", blue: "0000000000000000" });
            },
            g = function () {
                if ("undefined" == typeof e) throw new Error("Call not connected");
                e.send_signal("requestData", { dataType: "emoticon", red: "3c42a58199a5423c", green: "0000000000000000", blue: "0000000000000000" });
            },
            v = function () {
                if ("undefined" == typeof e) throw new Error("Call not connected");
                e.send_signal("requestData", { dataType: "lightOff" });
            },
            h = function () {
                if ("undefined" == typeof e) throw new Error("Call not connected");
                e.send_signal("requestData", { dataType: "zoomIn" });
            },
            b = function () {
                if ("undefined" == typeof e) throw new Error("Call not connected");
                e.send_signal("requestData", { dataType: "zoomOut" });
            },
            _ = function () {
                if ("undefined" == typeof e) throw new Error("Call not connected");
                e.send_signal("requestData", { dataType: "zoomZero" });
            },
            y = !1,
            k = function () {
                $(window).on("signal:robotData", function (e, t) {
                    if (isset(t.dataType) && "robot_battery" == t.dataType && isset(t.value)) {
                        if (isset(t.charging) && 1 == t.charging)
                            $("#batteryIcon i")
                                .removeClass("fa fa-battery-charging fa-battery-0 fa-battery-1 fa-battery-2 fa-battery-3 fa-battery-4 text-danger fa-cog fa-spin")
                                .addClass("fa fa-battery-charging")
                                .prop("title", I18n.t("robots.call.help.battery") + " : " + Math.round(t.value) + "% - " + I18n.t("robots.call.help.clicktorefresh")),
                                $("#batteryIcon a").attr("data-content", I18n.t("robots.call.help.batterylevel") + " : " + Math.round(t.value) + "%");
                        else {
                            var o;
                            (o = t.value >= 90 ? 4 : t.value >= 75 ? 3 : t.value >= 50 ? 2 : t.value >= 15 ? 1 : 0),
                                $("#batteryIcon i")
                                    .removeClass("fa fa-battery-charging fa-battery-0 fa-battery-1 fa-battery-2 fa-battery-3 fa-battery-4 text-danger fa-cog fa-spin")
                                    .addClass("fa fa-battery-" + o)
                                    .prop("title", I18n.t("robots.call.help.battery") + " : " + Math.round(t.value) + "% - " + I18n.t("robots.call.help.clicktorefresh")),
                                $("#batteryIcon a").attr("data-content", I18n.t("robots.call.help.batterylevel") + " : " + Math.round(t.value) + "%"),
                                1 > o && $("#batteryIcon i").addClass("text-danger");
                        }
                        y || $("#batteryIcon").removeClass("hide").hide().fadeIn(800), (y = !0);
                    }
                    isset(t.dataType) && "robot_pan_value" == t.dataType && isset(t.value_pan) && sliderpan.noUiSlider.set(t.value_pan),
                        isset(t.dataType) && "robot_tilt_value" == t.dataType && isset(t.value_tilt) && slidertilt.noUiSlider.set(t.value_tilt),
                        isset(t.dataType) && "robot_screen_mode" == t.dataType && isset(t.value) && (0 == t.value ? $("#toggleLight").css({ opacity: 0.5 }) : $("#toggleLight").css({ opacity: 1 })),
                        isset(t.dataType) &&
                            "sensor" == t.dataType &&
                            (console.log("Obstacle", t),
                            $("#enableProx").prop("checked") &&
                                isset(t.data) &&
                                isset(t.data.id) &&
                                isset(t.data.value) &&
                                $(".obstacle").each(function () {
                                    "0" == t.data.id &&
                                        ((capteur = "0"),
                                        (idx = $(this).data("id")),
                                        "bottom" == idx && (capteur = t.data.value.charAt(1) || t.data.value.charAt(2)),
                                        "up" == idx && (capteur = t.data.value.charAt(0) || t.data.value.charAt(3)),
                                        "1" == capteur
                                            ? ($(this).addClass("opaque"), toastr.warning(I18n.t("robots.call.help.obstacledetected"), I18n.t("robots.call.help.obstacle"), { preventDuplicates: !0 }))
                                            : $(this).removeClass("opaque"));
                                }));
                }),
                    $("#batteryIcon").on("click touchstart", function (e) {
                        e.preventDefault(), T(), y && $("#batteryIcon i").removeClass("fa-battery-0 fa-battery-1 fa-battery-2 fa-battery-3 fa-battery-4 text-danger fa-cog fa-spin").addClass("fa-cog fa-spin");
                    });
            },
            T = function () {
                if ("undefined" == typeof e) throw new Error("Call not connected");
                e.send_signal("requestData", { dataType: "robot_battery" });
            },
            I = function () {
                e.send_signal("requestData", { dataType: "dockstationEnabled" });
            },
            S = function () {
                e.send_signal("requestData", { dataType: "robotSpeedLevel" });
            },
            C = function () {
                e.send_signal("requestData", { dataType: "vaccumSensorEnabled" });
            },
            E = function () {
                e.send_signal("requestData", { dataType: "proximitySensorEnabled" });
            },
            R = function (t) {
                e.send_signal("requestData", { dataType: "vacuumSensorRemoteState", value: t });
            },
            U = function (t) {
                e.send_signal("requestData", { dataType: "proximitySensorRemoteState", value: t });
            },
            O = function (t) {
                e.send_signal("requestData", { dataType: "robotRemoteSpeedLevel", value: t });
            },
            A = function () {
                $(window).on("signal:tabletData", function (e, t) {
                    isset(t.dataType) && "dockstationEnabled" == t.dataType && 1 == t.value && window.realtime.call.controls.ui.displayDockstationButton();
                });
            },
            D = function () {
                $(window).on("signal:tabletData", function (e, t) {
                    isset(t.dataType) && "vacuumSensorActivated" == t.dataType && (window.realtime.call.controls.ui.enableVacuumSensor(t.value), Cookies.set("ubbo_vacuumSensorActivated", t.value));
                });
            },
            M = function () {
                $(window).on("signal:tabletData", function (e, t) {
                    isset(t.dataType) && "proximitySensorActivated" == t.dataType && (window.realtime.call.controls.ui.enableProximitySensor(t.value), Cookies.set("ubbo_proximitySensorActivated", t.value));
                });
            },
            x = function () {
                $(window).on("signal:tabletData", function (e, t) {
                    isset(t.dataType) && "robotSpeedLevel" == t.dataType && (window.realtime.call.controls.ui.setRobotSpeed(t.value), Cookies.set("ubbo_robotSpeedLevel", t.value));
                });
            },
            N = function () {
                $(window).on("signal:tabletData", function (e, t) {
                    isset(t.dataType) &&
                        "zoomLevel" == t.dataType &&
                        ($("#zoomIn").removeClass("hide"),
                        $("#zoomOut").removeClass("hide"),
                        0 == t.value
                            ? (window.realtime.call.controls.ui.enableZoomIn(), window.realtime.call.controls.ui.disableZoomOut())
                            : 100 == t.value
                            ? (window.realtime.call.controls.ui.disableZoomIn(), window.realtime.call.controls.ui.enableZoomOut())
                            : (window.realtime.call.controls.ui.enableZoomIn(), window.realtime.call.controls.ui.enableZoomOut()),
                        $("#zoomValue").html(t.value + "%"));
                });
            },
            P = function () {
                $(window).on("signal:tabletData", function (e, t) {
                    isset(t.dataType) &&
                        "volumeLevel" == t.dataType &&
                        ($("#volumeUp").removeClass("hide"),
                        $("#volumeDown").removeClass("hide"),
                        0 == t.value
                            ? (window.realtime.call.controls.ui.enableVolumeUp(), window.realtime.call.controls.ui.disableVolumeDown())
                            : 100 == t.value
                            ? (window.realtime.call.controls.ui.disableVolumeUp(), window.realtime.call.controls.ui.enableVolumeDown())
                            : (window.realtime.call.controls.ui.enableVolumeUp(), window.realtime.call.controls.ui.enableVolumeDown()),
                        $("#volumeValue").html(t.value + "%")),
                        isset(t.dataType) && "softwareVersion" == t.dataType && console.log("SW --------------");
                });
            },
            B = function () {
                $(window).on("signal:tabletData", function (e, t) {
                    if (isset(t.dataType) && "robot_battery" == t.dataType && isset(t.value)) {
                        if (isset(t.charging) && 1 == t.charging)
                            $("#batteryIcon i")
                                .removeClass("fa fa-battery-charging fa-battery-0 fa-battery-1 fa-battery-2 fa-battery-3 fa-battery-4 text-danger fa-cog fa-spin")
                                .addClass("fa fa-battery-charging")
                                .prop("title", I18n.t("robots.call.help.battery") + " : " + Math.round(t.value) + "% - " + I18n.t("robots.call.help.clicktorefresh")),
                                $("#batteryIcon a").attr("data-content", I18n.t("robots.call.help.batterylevel") + " : " + Math.round(t.value) + "%");
                        else {
                            var o;
                            (o = t.value >= 90 ? 4 : t.value >= 75 ? 3 : t.value >= 50 ? 2 : t.value >= 15 ? 1 : 0),
                                $("#batteryIcon i")
                                    .removeClass("fa fa-battery-charging fa-battery-0 fa-battery-1 fa-battery-2 fa-battery-3 fa-battery-4 text-danger fa-cog fa-spin")
                                    .addClass("fa fa-battery-" + o)
                                    .prop("title", I18n.t("robots.call.help.battery") + " : " + Math.round(t.value) + "% - " + I18n.t("robots.call.help.clicktorefresh")),
                                $("#batteryIcon a").attr("data-content", I18n.t("robots.call.help.batterylevel") + " : " + Math.round(t.value) + "%"),
                                1 > o && $("#batteryIcon i").addClass("text-danger");
                        }
                        y || $("#batteryIcon").removeClass("hide").hide().fadeIn(800), (y = !0);
                    }
                });
            },
            Y = function () {
                o = setInterval(function () {
                    y && T();
                }, 1e4);
            },
            j = function (t) {
                if (!a) {
                    if ("undefined" == typeof t) throw new Error("Call not connected");
                    (e = t), k(), c();
                    var o = function () {
                        $("#local_stream .OT_mute").hasClass("OT_active")
                            ? ($("#toggleSound .fa").removeClass("fa-microphone"), $("#toggleSound .fa").addClass("fa-microphone-slash"))
                            : ($("#toggleSound .fa").removeClass("fa-microphone-slash"), $("#toggleSound .fa").addClass("fa-microphone"));
                    };
                    $(window).on("stream:created", function (e, t) {
                        console.log("stream:created"),
                            $('[data-toggle="popover"]').popover({ html: !0, trigger: "manual", animation: !0 }),
                            $('[data-toggle="popover"]').click(function () {
                                $(this).popover("show"),
                                    setTimeout(function () {
                                        $(".popover").fadeOut("slow");
                                    }, 2e3),
                                    e.preventDefault();
                            }),
                            T(),
                            d(),
                            A(),
                            I(),
                            r();
                        var n = Cookies.get("ubbo_proximitySensorActivated"),
                            i = Cookies.get("ubbo_vacuumSensorActivated"),
                            a = Cookies.get("ubbo_robotSpeedLevel");
                        console.log("Prox=" + n),
                            console.log("Drop=" + i),
                            console.log("Speed=" + a),
                            null != n ? (U(n), window.realtime.call.controls.ui.enableProximitySensor(n)) : (M(), E()),
                            null != i ? (R(i), window.realtime.call.controls.ui.enableVacuumSensor(i)) : (D(), C()),
                            null != a ? (O(a), window.realtime.call.controls.ui.setRobotSpeed(a)) : (x(), S()),
                            _(),
                            N(),
                            P(),
                            B(),
                            $("#local_stream .OT_mute").on("click", function (e) {
                                setTimeout(o, 1);
                            });
                    }),
                        $("#toggleSound").on("click touchstart", function (e) {
                            e.preventDefault(), console.log("click microphone"), $("#local_stream .OT_mute").click();
                        }),
                        Y(),
                        (a = !0);
                }
            },
            K = function () {
                $(window).off("signal:tabletData signal:robotData"), $.magnificPopup.close(), clearInterval(o);
            };
        return { init: j, terminate: K, initGoogleMap: l, sendProximitySensorState: U, sendVacuumSensorState: R, sendRobotSpeedLevel: O };
    })()),
    (window.realtime.robot = (function () {
        var e,
            t = !1,
            o = "stop",
            n = 0,
            i = 0,
            a = function (o) {
                if ((t || (l(), (t = !0)), "undefined" == typeof o)) throw new Error("Call not connected");
                e = o;
            },
            l = function () {
                setInterval(function () {
                    "stopped" != o && ("stop" == o ? (e.send_signal("movement", { movement: "stop" }), (o = "stopped")) : e.send_signal("heartbeat", {}));
                }, 500);
            },
            r = function (n, i, a) {
                if ((console.log(n, i, a), "undefined" == typeof e)) throw new Error("Call not connected");
                e.send_signal("movement", { movement: n, angle: i, direction: a }), (o = n), t || (l(), (t = !0));
            },
            s = function (t, o, n) {
                if ("undefined" == typeof e) throw new Error("Call not connected");
                e.send_signal("movement", { movement: t, angle: o, direction: n });
            },
            c = function (t) {
                if ((console.log("tilt", t, "%"), "undefined" == typeof e)) throw new Error("Call not connected");
                e.send_signal("vertical_position", { inclinaison: parseInt((t / 100) * 127) }), (n = t);
            },
            d = function (t) {
                if ((console.log("pan", t, "%"), "undefined" == typeof e)) throw new Error("Call not connected");
                e.send_signal("horizontal_position", { angle: parseInt((t / 100) * 127) }), (i = t);
            },
            u = function (t) {
                if ("undefined" == typeof e) throw new Error("Call not connected");
                e.send_signal(t);
            },
            p = function () {
                if ("undefined" == typeof e) throw new Error("Call not connected");
                e.send_signal("goto_dockstation", {});
            };
        return {
            init: a,
            stop: function () {
                r("stop");
            },
            directionchange: function (e) {
                switch (e) {
                    case 0:
                        s("forward", 0);
                        break;
                    case 45:
                        s("forward", 60);
                        break;
                    case 90:
                        s("forward", 90);
                        break;
                    case 135:
                        s("forward", 120);
                        break;
                    case 180:
                        s("backward", 0);
                        break;
                    case 225:
                        s("backward", 60);
                        break;
                    case 270:
                        s("backward", 90);
                        break;
                    case 315:
                        s("backward", 120);
                }
            },
            forward: function () {
                r("forward", 90);
            },
            backward: function () {
                r("backward", 90);
            },
            left: function () {
                r("translate", "", "left");
            },
            right: function () {
                r("translate", "", "right");
            },
            forward_left: function () {
                r("forward", 135);
            },
            forward_right: function () {
                r("forward", 45);
            },
            backward_left: function () {
                r("backward", 135);
            },
            backward_right: function () {
                r("backward", 45);
            },
            translate: function (e) {
                ("left" == e || "right" == e) && r("translate", "", e);
            },
            selfRotate: function (e) {
                "left" == e ? r("forward", 180) : "right" == e && r("forward", 0);
            },
            move: r,
            tilt: c,
            pan: d,
            getTilt: function () {
                return n;
            },
            getPan: function () {
                return i;
            },
            send: u,
            goToDockstation: p,
        };
    })());
var Peer = function (e) {
        var t = this;
        if (
            ((this.session = null),
            (this.subscribers = {}),
            (this.streams = []),
            (this.remote_id = null),
            (this.sound_enabled = !0),
            (this.connectionCreated = !1),
            (this.peerId = null),
            (this.publishVideo = !0),
            (this.screenPublisher = null),
            !e.api_key)
        )
            throw new Error("You must define the api_key");
        if (!e.sessionId) throw new Error("You must define a sessionId");
        if (!e.peerId) throw new Error("You must define a peerId");
        if (!e.token) throw new Error("You must define a token");
        if (!e.local_video) throw new Error("You must define a local_video");
        if (!e.remote_video) throw new Error("You must define a remote_video");
        (this.initiate = function (o, n, i) {
            (t.peerId = o),
                (t.session = OT.initSession(e.api_key, n)),
                t.session.connect(i, function (e) {}),
                (t.status = window.realtime.status),
                (t.publishVideo = "true" == e.audio_only ? !1 : !0),
                t.session.on("sessionConnected", function () {
                    t.create_local_video(), console.log("sessionConnected"), $(window).trigger("session:connected");
                }),
                t.session.on("sessionDisconnected", function () {
                    $(window).trigger("session:disconnected");
                }),
                t.session.on("connectionCreated", function () {
                    this.connectionCreated || ($(window).trigger("connection:created"), (this.connectionCreated = !0));
                }),
                t.session.on("streamCreated", function (e) {
                    t.add_stream(e.stream), $(window).trigger("stream:created");
                }),
                t.session.on("streamDestroyed", function (e) {
                    (this.connectionCreated = !1), $(window).trigger("stream:destroyed");
                }),
                t.session.on("signal:robotData", function (e) {
                    "undefined" != typeof e.data && $(window).trigger("signal:robotData", JSON.parse(e.data));
                }),
                t.session.on("signal:ping", function (e) {
                    $(window).trigger("signal:ping", {});
                }),
                t.session.on("signal:tabletData", function (e) {
                    "undefined" != typeof e.data && $(window).trigger("signal:tabletData", JSON.parse(e.data));
                }),
                t.session.on("signal:wifiStatus", function (e) {
                    "undefined" != typeof e.data && $(window).trigger("signal:wifiStatus", JSON.parse(e.data));
                });
        }),
            (this.reload = function () {
                t.socket.emit("peer:reload");
            }),
            (this.create_local_video = function () {
                var t = this;
                $(e.local_video).append('<div id="local_stream" class="local_stream"></div>'),
                    $("#local_stream").draggable().resizable(),
                    (publisher = OT.initPublisher("local_stream", { publishVideo: this.publishVideo, disableAudioProcessing: !1, style: { buttonDisplayMode: "off" }, resolution: "1280x720", framerate: 30 })),
                    t.session.publish(publisher, function (e) {
                        if (e && e.code) {
                            if (1500 != e.code || !toastr) throw new Error("Error " + e.code + " while publishing local video" + e.message);
                            toastr.info(I18n.t("robots.call.help.connectwebcam"), I18n.t("robots.call.help.nowebcam"), { timeOut: 8e3 }),
                                (publisher = OT.initPublisher("local_stream", { disableAudioProcessing: !0, videoSource: null })),
                                t.session.publish(publisher, function (e) {
                                    if (e && e.code) {
                                        if (1500 != e.code || !toastr) throw new Error("Error " + e.code + " while publishing local video" + e.message);
                                        toastr.info(I18n.t("robots.call.help.connectwebcam"), I18n.t("robots.call.help.nowebcam"), { timeOut: 8e3 });
                                    }
                                });
                        }
                    });
            }),
            (this.add_stream = function (o) {
                t.streams.push(o),
                    o.connection.connectionId != t.session.connection.connectionId &&
                        ((t.remote_id = o.connection.connectionId),
                        o.name.match(/front/)
                            ? (console.log("FRONT -------------------------------------------"),
                              $(e.remote_video).append("<div id='" + o.streamId + "'></div>"),
                              (t.subscribers[o.streamId] = t.session.subscribe(o, o.streamId, { width: "100%", height: "100%", style: { buttonDisplayMode: "on", nameDisplayMode: "off" } })))
                            : o.name.match(/audio/)
                            ? (console.log("AUDIO -------------------------------------------"),
                              $(e.remote_audio).append("<div id='" + o.streamId + "'></div>"),
                              (t.subscribers[o.streamId] = t.session.subscribe(o, o.streamId, { width: "100%", height: "100%", style: { buttonDisplayMode: "on", nameDisplayMode: "off" } })))
                            : (console.log("AUTRE ---------------------------------------------"),
                              console.log(o.name),
                              $(e.remote_video_bottom).append("<div id='" + o.streamId + "'></div>"),
                              $(e.remote_video_bottom).draggable().resizable({ aspectRatio: !0 }),
                              (t.subscribers[o.streamId] = t.session.subscribe(o, o.streamId, { width: "100%", height: "100%", style: { buttonDisplayMode: "on", nameDisplayMode: "off" } }))));
            }),
            (this.send_signal = function (e, o) {
                null != t.session && t.session.isConnected() && ((o.pilotTime = Date.now()), (o = JSON.stringify(o)), t.session.signal({ data: o, type: e }));
            }),
            (this.endCall = function () {
                t.status.endCall(t.peerId);
            }),
            (this.toggle_sound = function () {
                t.streams.forEach(function (e) {
                    t.sound_enabled ? e.setAudioVolume(0) : e.setAudioVolume(100);
                }),
                    (t.sound_enabled = !t.sound_enabled);
            }),
            this.initiate(e.peerId, e.sessionId, e.token),
            (this.share_user_screen = function (e) {
                null == t.screenPublisher
                    ? OT.checkScreenSharingCapability(function (o) {
                          o.supported && o.extensionRegistered !== !1
                              ? o.extensionInstalled === !1
                                  ? console.log("Install the extension.")
                                  : (console.log("Screen sharing is available."),
                                    (t.screenPublisher = OT.initPublisher("screen-preview", { videoSource: "screen", name: "shared_screen" }, function (o) {
                                        o
                                            ? console.log(o.message)
                                            : t.session
                                                  .publish(t.screenPublisher, function (e) {
                                                      e && console.log(e.message);
                                                  })
                                                  .on("streamCreated", function (t) {
                                                      console.log("Publisher  " + t.stream.name), $(e).addClass("share-screen-active");
                                                  });
                                    })))
                              : console.log("This browser does not support screen sharing.");
                      })
                    : (console.log("destroy publisher."), t.screenPublisher.destroy(), (t.screenPublisher = null), $(e).removeClass("share-screen-active"));
            });
    },
    ENV = {
        UBBO_DOMAIN: "com.ubbo.io",
        UBBO_REALTIME_SERVER: "com-realtime.ubbo.io",
        MAP_MAPBOX_ACCESS_TOKEN: "pk.eyJ1IjoiYXh5biIsImEiOiJjazY5NHd6d28wNmYzM2xrOXpreXN0d2xwIn0.eZhRrY_p83SNO367vu8jXQ",
        MAP_MAPQUEST: "nEhiAjcZyTBG9l1oxNVSYEqeVqNhKNDh",
        OPENTOK_API_KEY: "45308382",
    };
