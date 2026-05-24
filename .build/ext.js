"use strict";
var __StripeExtExports = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined")
      return require.apply(this, arguments);
    throw new Error('Dynamic require of "' + x + '" is not supported');
  });
  var __commonJS = (cb, mod) => function __require2() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // node_modules/@stripe/ui-extension-sdk/version.js
  var require_version = __commonJS({
    "node_modules/@stripe/ui-extension-sdk/version.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.SDK_VERSION = void 0;
      exports.SDK_VERSION = "9.1.0";
    }
  });

  // node_modules/@stripe/ui-extension-sdk/ui/index.js
  var require_ui = __commonJS({
    "node_modules/@stripe/ui-extension-sdk/ui/index.js"(exports) {
      "use strict";
      Object.defineProperty(exports, "__esModule", { value: true });
      exports.TableHeaderCell = exports.TableHead = exports.TableFooter = exports.TableCell = exports.TableBody = exports.Tab = exports.TabPanels = exports.TabPanel = exports.TabList = exports.Switch = exports.StripeFileUploader = exports.Spinner = exports.Sparkline = exports.SignInView = exports.SettingsView = exports.Select = exports.Radio = exports.PropertyList = exports.PropertyListItem = exports.PlatformConfigurationView = exports.OnboardingView = exports.Menu = exports.MenuItem = exports.MenuGroup = exports.List = exports.ListItem = exports.Link = exports.LineChart = exports.Inline = exports.Img = exports.Icon = exports.FormFieldGroup = exports.FocusView = exports.Divider = exports.DetailPageTable = exports.DetailPagePropertyList = exports.DetailPageModule = exports.DateField = exports.ContextView = exports.Chip = exports.ChipList = exports.Checkbox = exports.Button = exports.ButtonGroup = exports.Box = exports.BarChart = exports.Banner = exports.Badge = exports.Accordion = exports.AccordionItem = void 0;
      exports.Tooltip = exports.TextField = exports.TextArea = exports.TaskList = exports.TaskListItem = exports.Tabs = exports.TableRow = exports.Table = void 0;
      var jsx_runtime_1 = __require("react/jsx-runtime");
      var react_1 = __require("@remote-ui/react");
      var version_1 = require_version();
      var withSdkProps = (Component) => {
        const wrappedComponentName = Component.displayName || Component.toString();
        const WithSdkProps = (props) => (0, jsx_runtime_1.jsx)(Component, __spreadProps(__spreadValues({}, props), { wrappedComponentName, sdkVersion: version_1.SDK_VERSION, schemaVersion: "v9" }));
        WithSdkProps.wrappedComponentName = wrappedComponentName;
        return WithSdkProps;
      };
      var defineComponent = (name, fragmentProps, wrapWithSdkProps) => {
        const remoteComponent = (0, react_1.createRemoteReactComponent)(name, {
          fragmentProps
        });
        if (!wrapWithSdkProps) {
          return remoteComponent;
        }
        return withSdkProps(remoteComponent);
      };
      exports.AccordionItem = defineComponent("AccordionItem", ["title", "actions", "media", "subtitle"], true);
      exports.Accordion = defineComponent("Accordion", [], true);
      exports.Badge = defineComponent("Badge", [], true);
      exports.Banner = defineComponent("Banner", ["actions", "description", "title"], true);
      exports.BarChart = defineComponent("BarChart", [], true);
      exports.Box = defineComponent("Box", [], true);
      exports.ButtonGroup = defineComponent("ButtonGroup", ["menuTrigger"], true);
      exports.Button = defineComponent("Button", [], true);
      exports.Checkbox = defineComponent("Checkbox", ["label"], true);
      exports.ChipList = defineComponent("ChipList", [], true);
      exports.Chip = defineComponent("Chip", [], true);
      exports.ContextView = defineComponent("ContextView", ["actions", "banner", "footerContent", "primaryAction", "secondaryAction"], true);
      exports.DateField = defineComponent("DateField", ["label"], true);
      exports.DetailPageModule = defineComponent("DetailPageModule", [], true);
      exports.DetailPagePropertyList = defineComponent("DetailPagePropertyList", [], true);
      exports.DetailPageTable = defineComponent("DetailPageTable", [], true);
      exports.Divider = defineComponent("Divider", [], true);
      exports.FocusView = defineComponent("FocusView", ["footerContent", "primaryAction", "secondaryAction"], true);
      exports.FormFieldGroup = defineComponent("FormFieldGroup", [], true);
      exports.Icon = defineComponent("Icon", [], true);
      exports.Img = defineComponent("Img", [], true);
      exports.Inline = defineComponent("Inline", [], true);
      exports.LineChart = defineComponent("LineChart", [], true);
      exports.Link = defineComponent("Link", [], true);
      exports.ListItem = defineComponent("ListItem", ["icon", "image", "secondaryTitle", "title", "value"], true);
      exports.List = defineComponent("List", [], true);
      exports.MenuGroup = defineComponent("MenuGroup", ["title"], true);
      exports.MenuItem = defineComponent("MenuItem", [], true);
      exports.Menu = defineComponent("Menu", ["trigger"], true);
      exports.OnboardingView = defineComponent("OnboardingView", ["error"], true);
      exports.PlatformConfigurationView = defineComponent("PlatformConfigurationView", [], true);
      exports.PropertyListItem = defineComponent("PropertyListItem", ["label", "value"], true);
      exports.PropertyList = defineComponent("PropertyList", [], true);
      exports.Radio = defineComponent("Radio", ["label"], true);
      exports.Select = defineComponent("Select", ["label"], true);
      exports.SettingsView = defineComponent("SettingsView", [], true);
      exports.SignInView = defineComponent("SignInView", ["descriptionActionContents", "footerContent"], true);
      exports.Sparkline = defineComponent("Sparkline", [], true);
      exports.Spinner = defineComponent("Spinner", [], true);
      exports.StripeFileUploader = defineComponent("StripeFileUploader", [], true);
      exports.Switch = defineComponent("Switch", ["label"], true);
      exports.TabList = defineComponent("TabList", [], true);
      exports.TabPanel = defineComponent("TabPanel", [], true);
      exports.TabPanels = defineComponent("TabPanels", [], true);
      exports.Tab = defineComponent("Tab", [], true);
      exports.TableBody = defineComponent("TableBody", [], true);
      exports.TableCell = defineComponent("TableCell", [], true);
      exports.TableFooter = defineComponent("TableFooter", [], true);
      exports.TableHead = defineComponent("TableHead", [], true);
      exports.TableHeaderCell = defineComponent("TableHeaderCell", [], true);
      exports.Table = defineComponent("Table", [], true);
      exports.TableRow = defineComponent("TableRow", [], true);
      exports.Tabs = defineComponent("Tabs", [], true);
      exports.TaskListItem = defineComponent("TaskListItem", [], true);
      exports.TaskList = defineComponent("TaskList", [], true);
      exports.TextArea = defineComponent("TextArea", ["label"], true);
      exports.TextField = defineComponent("TextField", ["label"], true);
      exports.Tooltip = defineComponent("Tooltip", ["trigger"], true);
    }
  });

  // .build/manifest.js
  var manifest_exports = {};
  __export(manifest_exports, {
    BUILD_TIME: () => BUILD_TIME,
    NexusOverview: () => NexusOverview_default,
    PaymentNexusDetail: () => PaymentNexusDetail_default,
    default: () => manifest_default
  });

  // src/views/NexusOverview.tsx
  var import_ui = __toESM(require_ui());
  var import_react = __require("react");

  // src/config.ts
  var BACKEND_URL = "https://api.taxshieldagent.com";

  // src/views/NexusOverview.tsx
  var import_jsx_runtime = __require("react/jsx-runtime");
  function riskBadgeTone(level) {
    switch (level) {
      case "CRITICAL":
        return "critical";
      case "RED":
        return "critical";
      case "YELLOW":
        return "warning";
      default:
        return "info";
    }
  }
  var NexusOverview = ({
    userContext,
    environment
  }) => {
    var _a, _b, _c;
    const [loading, setLoading] = (0, import_react.useState)(true);
    const [data, setData] = (0, import_react.useState)(null);
    const [error, setError] = (0, import_react.useState)(null);
    const [confirmingState, setConfirmingState] = (0, import_react.useState)(null);
    const [fixingState, setFixingState] = (0, import_react.useState)(null);
    const [fixedStates, setFixedStates] = (0, import_react.useState)(/* @__PURE__ */ new Set());
    const accountId = (_b = (_a = userContext == null ? void 0 : userContext.account) == null ? void 0 : _a.id) != null ? _b : "";
    const fetchNexusStatus = (0, import_react.useCallback)(() => __async(void 0, null, function* () {
      setLoading(true);
      setError(null);
      try {
        const resp = yield fetch(`${BACKEND_URL}/stripe-app/nexus-summary`, {
          headers: { "X-Stripe-Account": accountId }
        });
        if (!resp.ok) {
          throw new Error(`Backend returned ${resp.status}`);
        }
        const json = yield resp.json();
        setData(json);
      } catch (err) {
        setError(err.message || "Failed to load nexus status");
      } finally {
        setLoading(false);
      }
    }), [accountId]);
    (0, import_react.useEffect)(() => {
      if (accountId) {
        fetchNexusStatus();
      }
    }, [accountId, fetchNexusStatus]);
    const handleConfirmFix = (state) => __async(void 0, null, function* () {
      if (!state.alert_id)
        return;
      setFixingState(state.state);
      try {
        const resp = yield fetch(
          `${BACKEND_URL}/alerts/${state.alert_id}/confirm-fix`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Stripe-Account": accountId
            },
            body: JSON.stringify({
              user_confirmed: true,
              state: state.state
            })
          }
        );
        if (!resp.ok) {
          throw new Error(`Fix failed with status ${resp.status}`);
        }
        setFixedStates((prev) => new Set(prev).add(state.state));
      } catch (err) {
        setError(`Fix failed for ${state.state}: ${err.message}`);
      } finally {
        setFixingState(null);
        setConfirmingState(null);
      }
    });
    if (loading) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Box, {
        css: { padding: "large", layout: "column", alignX: "center" },
        children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Spinner, {}),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Box, {
            css: { marginTop: "medium" },
            children: "Loading nexus status..."
          })
        ]
      });
    }
    if (error && !data) {
      return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Box, {
        css: { padding: "large" },
        children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Banner, {
          type: "critical",
          title: "Connection Error",
          description: error,
          actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Button, {
            onPress: fetchNexusStatus,
            children: "Retry"
          })
        })
      });
    }
    const atRiskStates = (_c = data == null ? void 0 : data.states) != null ? _c : [];
    const hasRisks = atRiskStates.length > 0;
    return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Box, {
      css: { padding: "large", layout: "column", gap: "medium" },
      children: [
        !hasRisks ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Banner, {
          type: "default",
          title: "All Clear",
          description: "No nexus risks detected across your connected platforms."
        }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Banner, {
          type: "critical",
          title: `${data.at_risk_count} state${data.at_risk_count !== 1 ? "s" : ""} at risk`,
          description: data.critical_count > 0 ? `${data.critical_count} require immediate action \u2014 you may already owe sales tax.` : "Review the states below and register before you cross a threshold."
        }),
        error && data && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Banner, {
          type: "warning",
          title: "Warning",
          description: error
        }),
        hasRisks && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.List, {
          children: atRiskStates.map((s) => {
            const isFixed = fixedStates.has(s.state);
            const isConfirming = confirmingState === s.state;
            const isFixing = fixingState === s.state;
            return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.ListItem, {
              id: s.state,
              title: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Inline, {
                children: s.state
              }),
              secondaryTitle: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Inline, {
                children: [
                  "$",
                  s.total_sales.toLocaleString(),
                  " / $",
                  s.threshold.toLocaleString(),
                  " (",
                  s.pct.toFixed(0),
                  "%)"
                ]
              }),
              value: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Inline, {
                css: { layout: "row", gap: "small", alignY: "center" },
                children: [
                  /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Badge, {
                    type: riskBadgeTone(s.risk_level),
                    children: s.risk_level
                  }),
                  isFixed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Badge, {
                    type: "info",
                    children: "Registered"
                  }) : isConfirming ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Inline, {
                    css: { layout: "column", gap: "xsmall" },
                    children: [
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Box, {
                        children: [
                          "Register for sales tax in ",
                          s.state,
                          "? $1 fee applies."
                        ]
                      }),
                      /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_ui.Inline, {
                        css: { layout: "row", gap: "xsmall" },
                        children: [
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Button, {
                            type: "primary",
                            onPress: () => handleConfirmFix(s),
                            disabled: isFixing,
                            children: isFixing ? "Processing..." : "Confirm"
                          }),
                          /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Button, {
                            onPress: () => setConfirmingState(null),
                            disabled: isFixing,
                            children: "Cancel"
                          })
                        ]
                      })
                    ]
                  }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Button, {
                    type: "primary",
                    onPress: () => setConfirmingState(s.state),
                    disabled: !s.alert_id,
                    children: "FIX \u2014 $1"
                  })
                ]
              })
            }, s.state);
          })
        }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Box, {
          css: { marginTop: "medium" },
          children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_ui.Button, {
            type: "secondary",
            href: `${BACKEND_URL}/dashboard`,
            children: "Connect More Platforms"
          })
        })
      ]
    });
  };
  var NexusOverview_default = NexusOverview;

  // src/views/PaymentNexusDetail.tsx
  var import_ui2 = __toESM(require_ui());
  var import_react2 = __require("react");
  var import_jsx_runtime2 = __require("react/jsx-runtime");
  function riskBadgeTone2(level) {
    switch (level) {
      case "CRITICAL":
      case "RED":
        return "critical";
      case "YELLOW":
        return "warning";
      default:
        return "info";
    }
  }
  var PaymentNexusDetail = ({
    userContext,
    environment
  }) => {
    var _a, _b;
    const [loading, setLoading] = (0, import_react2.useState)(true);
    const [error, setError] = (0, import_react2.useState)(null);
    const [state, setState] = (0, import_react2.useState)(null);
    const [totalSales, setTotalSales] = (0, import_react2.useState)(0);
    const [threshold, setThreshold] = (0, import_react2.useState)(0);
    const [pct, setPct] = (0, import_react2.useState)(0);
    const [riskLevel, setRiskLevel] = (0, import_react2.useState)("GREEN");
    const accountId = (_b = (_a = userContext == null ? void 0 : userContext.account) == null ? void 0 : _a.id) != null ? _b : "";
    (0, import_react2.useEffect)(() => {
      if (!accountId)
        return;
      (() => __async(void 0, null, function* () {
        var _a2, _b2, _c, _d;
        try {
          const resp = yield fetch(`${BACKEND_URL}/stripe-app/nexus-summary`, {
            headers: { "X-Stripe-Account": accountId }
          });
          if (!resp.ok) {
            throw new Error(`Backend returned ${resp.status}`);
          }
          const data = yield resp.json();
          if (data.states && data.states.length > 0) {
            const top = data.states[0];
            setState(top.state);
            setTotalSales((_a2 = top.total_sales) != null ? _a2 : 0);
            setThreshold((_b2 = top.threshold) != null ? _b2 : 0);
            setPct((_c = top.pct) != null ? _c : 0);
            setRiskLevel((_d = top.risk_level) != null ? _d : "GREEN");
          }
        } catch (err) {
          setError(err.message || "Failed to load nexus data");
        } finally {
          setLoading(false);
        }
      }))();
    }, [accountId]);
    if (loading)
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_ui2.Spinner, {});
    if (error) {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_ui2.Box, {
        css: { padding: "medium" },
        children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_ui2.Banner, {
          type: "critical",
          title: "Could not load nexus data",
          description: error
        })
      });
    }
    if (!state) {
      return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_ui2.Box, {
        css: { padding: "medium" },
        children: "No nexus risk detected for this payment."
      });
    }
    return /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_ui2.Box, {
      css: { padding: "medium", layout: "column", gap: "small" },
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_ui2.Inline, {
          css: { fontWeight: "bold" },
          children: state
        }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_ui2.Inline, {
          children: [
            "$",
            totalSales.toLocaleString(),
            " / $",
            threshold.toLocaleString(),
            " (",
            pct.toFixed(0),
            "%)"
          ]
        }),
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_ui2.Badge, {
          type: riskBadgeTone2(riskLevel),
          children: riskLevel
        })
      ]
    });
  };
  var PaymentNexusDetail_default = PaymentNexusDetail;

  // .build/manifest.js
  __reExport(manifest_exports, __toESM(require_version()));
  var BUILD_TIME = "2026-04-12 15:43:05.745098211 -0400 EDT m=+6.357220342";
  var manifest_default = {
    "$schema": "https://stripe.com/stripe-app.schema.json",
    "distribution_type": "public",
    "icon": "./icon.png",
    "id": "com.taxshieldagent.monitor",
    "name": "TaxShieldAgent",
    "permissions": [
      {
        "permission": "payment_intent_read",
        "purpose": "Read PaymentIntent metadata to extract the destination state for each transaction, enabling per-state sales aggregation and Economic Nexus threshold monitoring across all 50 US states."
      },
      {
        "permission": "tax_settings_write",
        "purpose": "Create Stripe Tax Registrations in US states when a merchant approves a compliance fix. Registration only occurs after explicit merchant confirmation \u2014 the app never acts autonomously."
      },
      {
        "permission": "charge_write",
        "purpose": "Apply a $1 application fee to the merchant's most recent charge when a state tax registration is successfully completed. This is the app's per-action monetisation fee."
      }
    ],
    "post_install_action": {
      "type": "external",
      "url": "https://api.taxshieldagent.com/stripe-app/stripe-app-callback"
    },
    "ui_extension": {
      "content_security_policy": {
        "connect-src": [
          "https://api.taxshieldagent.com/stripe-app/",
          "https://api.taxshieldagent.com/nexus/"
        ],
        "purpose": "Connect to TaxShieldAgent backend API for nexus risk data and compliance actions"
      },
      "views": [
        {
          "component": "NexusOverview",
          "viewport": "stripe.dashboard.home.overview"
        },
        {
          "component": "PaymentNexusDetail",
          "viewport": "stripe.dashboard.payment.detail"
        }
      ]
    },
    "version": "0.4.2"
  };
  return __toCommonJS(manifest_exports);
})();
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vbm9kZV9tb2R1bGVzL0BzdHJpcGUvdWktZXh0ZW5zaW9uLXNkay92ZXJzaW9uLmpzIiwgIi4uL25vZGVfbW9kdWxlcy9Ac3RyaXBlL3VpLWV4dGVuc2lvbi1zZGsvdWkvaW5kZXguanMiLCAibWFuaWZlc3QuanMiLCAiLi4vc3JjL3ZpZXdzL05leHVzT3ZlcnZpZXcudHN4IiwgIi4uL3NyYy9jb25maWcudHMiLCAiLi4vc3JjL3ZpZXdzL1BheW1lbnROZXh1c0RldGFpbC50c3giXSwKICAic291cmNlc0NvbnRlbnQiOiBbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5TREtfVkVSU0lPTiA9IHZvaWQgMDtcbmV4cG9ydHMuU0RLX1ZFUlNJT04gPSAnOS4xLjAnO1xuIiwgIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5UYWJsZUhlYWRlckNlbGwgPSBleHBvcnRzLlRhYmxlSGVhZCA9IGV4cG9ydHMuVGFibGVGb290ZXIgPSBleHBvcnRzLlRhYmxlQ2VsbCA9IGV4cG9ydHMuVGFibGVCb2R5ID0gZXhwb3J0cy5UYWIgPSBleHBvcnRzLlRhYlBhbmVscyA9IGV4cG9ydHMuVGFiUGFuZWwgPSBleHBvcnRzLlRhYkxpc3QgPSBleHBvcnRzLlN3aXRjaCA9IGV4cG9ydHMuU3RyaXBlRmlsZVVwbG9hZGVyID0gZXhwb3J0cy5TcGlubmVyID0gZXhwb3J0cy5TcGFya2xpbmUgPSBleHBvcnRzLlNpZ25JblZpZXcgPSBleHBvcnRzLlNldHRpbmdzVmlldyA9IGV4cG9ydHMuU2VsZWN0ID0gZXhwb3J0cy5SYWRpbyA9IGV4cG9ydHMuUHJvcGVydHlMaXN0ID0gZXhwb3J0cy5Qcm9wZXJ0eUxpc3RJdGVtID0gZXhwb3J0cy5QbGF0Zm9ybUNvbmZpZ3VyYXRpb25WaWV3ID0gZXhwb3J0cy5PbmJvYXJkaW5nVmlldyA9IGV4cG9ydHMuTWVudSA9IGV4cG9ydHMuTWVudUl0ZW0gPSBleHBvcnRzLk1lbnVHcm91cCA9IGV4cG9ydHMuTGlzdCA9IGV4cG9ydHMuTGlzdEl0ZW0gPSBleHBvcnRzLkxpbmsgPSBleHBvcnRzLkxpbmVDaGFydCA9IGV4cG9ydHMuSW5saW5lID0gZXhwb3J0cy5JbWcgPSBleHBvcnRzLkljb24gPSBleHBvcnRzLkZvcm1GaWVsZEdyb3VwID0gZXhwb3J0cy5Gb2N1c1ZpZXcgPSBleHBvcnRzLkRpdmlkZXIgPSBleHBvcnRzLkRldGFpbFBhZ2VUYWJsZSA9IGV4cG9ydHMuRGV0YWlsUGFnZVByb3BlcnR5TGlzdCA9IGV4cG9ydHMuRGV0YWlsUGFnZU1vZHVsZSA9IGV4cG9ydHMuRGF0ZUZpZWxkID0gZXhwb3J0cy5Db250ZXh0VmlldyA9IGV4cG9ydHMuQ2hpcCA9IGV4cG9ydHMuQ2hpcExpc3QgPSBleHBvcnRzLkNoZWNrYm94ID0gZXhwb3J0cy5CdXR0b24gPSBleHBvcnRzLkJ1dHRvbkdyb3VwID0gZXhwb3J0cy5Cb3ggPSBleHBvcnRzLkJhckNoYXJ0ID0gZXhwb3J0cy5CYW5uZXIgPSBleHBvcnRzLkJhZGdlID0gZXhwb3J0cy5BY2NvcmRpb24gPSBleHBvcnRzLkFjY29yZGlvbkl0ZW0gPSB2b2lkIDA7XG5leHBvcnRzLlRvb2x0aXAgPSBleHBvcnRzLlRleHRGaWVsZCA9IGV4cG9ydHMuVGV4dEFyZWEgPSBleHBvcnRzLlRhc2tMaXN0ID0gZXhwb3J0cy5UYXNrTGlzdEl0ZW0gPSBleHBvcnRzLlRhYnMgPSBleHBvcnRzLlRhYmxlUm93ID0gZXhwb3J0cy5UYWJsZSA9IHZvaWQgMDtcbmNvbnN0IGpzeF9ydW50aW1lXzEgPSByZXF1aXJlKFwicmVhY3QvanN4LXJ1bnRpbWVcIik7XG5jb25zdCByZWFjdF8xID0gcmVxdWlyZShcIkByZW1vdGUtdWkvcmVhY3RcIik7XG5jb25zdCB2ZXJzaW9uXzEgPSByZXF1aXJlKFwiLi4vdmVyc2lvblwiKTtcbmNvbnN0IHdpdGhTZGtQcm9wcyA9IChDb21wb25lbnQpID0+IHtcbiAgICBjb25zdCB3cmFwcGVkQ29tcG9uZW50TmFtZSA9IENvbXBvbmVudC5kaXNwbGF5TmFtZSB8fCBDb21wb25lbnQudG9TdHJpbmcoKTtcbiAgICBjb25zdCBXaXRoU2RrUHJvcHMgPSAocHJvcHMpID0+ICgoMCwganN4X3J1bnRpbWVfMS5qc3gpKENvbXBvbmVudCwgeyAuLi5wcm9wcywgd3JhcHBlZENvbXBvbmVudE5hbWU6IHdyYXBwZWRDb21wb25lbnROYW1lLCBzZGtWZXJzaW9uOiB2ZXJzaW9uXzEuU0RLX1ZFUlNJT04sIHNjaGVtYVZlcnNpb246IFwidjlcIiB9KSk7XG4gICAgV2l0aFNka1Byb3BzLndyYXBwZWRDb21wb25lbnROYW1lID0gd3JhcHBlZENvbXBvbmVudE5hbWU7XG4gICAgcmV0dXJuIFdpdGhTZGtQcm9wcztcbn07XG5jb25zdCBkZWZpbmVDb21wb25lbnQgPSAobmFtZSwgZnJhZ21lbnRQcm9wcywgd3JhcFdpdGhTZGtQcm9wcykgPT4ge1xuICAgIGNvbnN0IHJlbW90ZUNvbXBvbmVudCA9ICgwLCByZWFjdF8xLmNyZWF0ZVJlbW90ZVJlYWN0Q29tcG9uZW50KShuYW1lLCB7XG4gICAgICAgIGZyYWdtZW50UHJvcHMsXG4gICAgfSk7XG4gICAgaWYgKCF3cmFwV2l0aFNka1Byb3BzKSB7XG4gICAgICAgIHJldHVybiByZW1vdGVDb21wb25lbnQ7XG4gICAgfVxuICAgIHJldHVybiB3aXRoU2RrUHJvcHMocmVtb3RlQ29tcG9uZW50KTtcbn07XG5leHBvcnRzLkFjY29yZGlvbkl0ZW0gPSBkZWZpbmVDb21wb25lbnQoJ0FjY29yZGlvbkl0ZW0nLCBbJ3RpdGxlJywgJ2FjdGlvbnMnLCAnbWVkaWEnLCAnc3VidGl0bGUnXSwgdHJ1ZSk7XG5leHBvcnRzLkFjY29yZGlvbiA9IGRlZmluZUNvbXBvbmVudCgnQWNjb3JkaW9uJywgW10sIHRydWUpO1xuZXhwb3J0cy5CYWRnZSA9IGRlZmluZUNvbXBvbmVudCgnQmFkZ2UnLCBbXSwgdHJ1ZSk7XG5leHBvcnRzLkJhbm5lciA9IGRlZmluZUNvbXBvbmVudCgnQmFubmVyJywgWydhY3Rpb25zJywgJ2Rlc2NyaXB0aW9uJywgJ3RpdGxlJ10sIHRydWUpO1xuZXhwb3J0cy5CYXJDaGFydCA9IGRlZmluZUNvbXBvbmVudCgnQmFyQ2hhcnQnLCBbXSwgdHJ1ZSk7XG5leHBvcnRzLkJveCA9IGRlZmluZUNvbXBvbmVudCgnQm94JywgW10sIHRydWUpO1xuZXhwb3J0cy5CdXR0b25Hcm91cCA9IGRlZmluZUNvbXBvbmVudCgnQnV0dG9uR3JvdXAnLCBbJ21lbnVUcmlnZ2VyJ10sIHRydWUpO1xuZXhwb3J0cy5CdXR0b24gPSBkZWZpbmVDb21wb25lbnQoJ0J1dHRvbicsIFtdLCB0cnVlKTtcbmV4cG9ydHMuQ2hlY2tib3ggPSBkZWZpbmVDb21wb25lbnQoJ0NoZWNrYm94JywgWydsYWJlbCddLCB0cnVlKTtcbmV4cG9ydHMuQ2hpcExpc3QgPSBkZWZpbmVDb21wb25lbnQoJ0NoaXBMaXN0JywgW10sIHRydWUpO1xuZXhwb3J0cy5DaGlwID0gZGVmaW5lQ29tcG9uZW50KCdDaGlwJywgW10sIHRydWUpO1xuZXhwb3J0cy5Db250ZXh0VmlldyA9IGRlZmluZUNvbXBvbmVudCgnQ29udGV4dFZpZXcnLCBbJ2FjdGlvbnMnLCAnYmFubmVyJywgJ2Zvb3RlckNvbnRlbnQnLCAncHJpbWFyeUFjdGlvbicsICdzZWNvbmRhcnlBY3Rpb24nXSwgdHJ1ZSk7XG5leHBvcnRzLkRhdGVGaWVsZCA9IGRlZmluZUNvbXBvbmVudCgnRGF0ZUZpZWxkJywgWydsYWJlbCddLCB0cnVlKTtcbmV4cG9ydHMuRGV0YWlsUGFnZU1vZHVsZSA9IGRlZmluZUNvbXBvbmVudCgnRGV0YWlsUGFnZU1vZHVsZScsIFtdLCB0cnVlKTtcbmV4cG9ydHMuRGV0YWlsUGFnZVByb3BlcnR5TGlzdCA9IGRlZmluZUNvbXBvbmVudCgnRGV0YWlsUGFnZVByb3BlcnR5TGlzdCcsIFtdLCB0cnVlKTtcbmV4cG9ydHMuRGV0YWlsUGFnZVRhYmxlID0gZGVmaW5lQ29tcG9uZW50KCdEZXRhaWxQYWdlVGFibGUnLCBbXSwgdHJ1ZSk7XG5leHBvcnRzLkRpdmlkZXIgPSBkZWZpbmVDb21wb25lbnQoJ0RpdmlkZXInLCBbXSwgdHJ1ZSk7XG5leHBvcnRzLkZvY3VzVmlldyA9IGRlZmluZUNvbXBvbmVudCgnRm9jdXNWaWV3JywgWydmb290ZXJDb250ZW50JywgJ3ByaW1hcnlBY3Rpb24nLCAnc2Vjb25kYXJ5QWN0aW9uJ10sIHRydWUpO1xuZXhwb3J0cy5Gb3JtRmllbGRHcm91cCA9IGRlZmluZUNvbXBvbmVudCgnRm9ybUZpZWxkR3JvdXAnLCBbXSwgdHJ1ZSk7XG5leHBvcnRzLkljb24gPSBkZWZpbmVDb21wb25lbnQoJ0ljb24nLCBbXSwgdHJ1ZSk7XG5leHBvcnRzLkltZyA9IGRlZmluZUNvbXBvbmVudCgnSW1nJywgW10sIHRydWUpO1xuZXhwb3J0cy5JbmxpbmUgPSBkZWZpbmVDb21wb25lbnQoJ0lubGluZScsIFtdLCB0cnVlKTtcbmV4cG9ydHMuTGluZUNoYXJ0ID0gZGVmaW5lQ29tcG9uZW50KCdMaW5lQ2hhcnQnLCBbXSwgdHJ1ZSk7XG5leHBvcnRzLkxpbmsgPSBkZWZpbmVDb21wb25lbnQoJ0xpbmsnLCBbXSwgdHJ1ZSk7XG5leHBvcnRzLkxpc3RJdGVtID0gZGVmaW5lQ29tcG9uZW50KCdMaXN0SXRlbScsIFsnaWNvbicsICdpbWFnZScsICdzZWNvbmRhcnlUaXRsZScsICd0aXRsZScsICd2YWx1ZSddLCB0cnVlKTtcbmV4cG9ydHMuTGlzdCA9IGRlZmluZUNvbXBvbmVudCgnTGlzdCcsIFtdLCB0cnVlKTtcbmV4cG9ydHMuTWVudUdyb3VwID0gZGVmaW5lQ29tcG9uZW50KCdNZW51R3JvdXAnLCBbJ3RpdGxlJ10sIHRydWUpO1xuZXhwb3J0cy5NZW51SXRlbSA9IGRlZmluZUNvbXBvbmVudCgnTWVudUl0ZW0nLCBbXSwgdHJ1ZSk7XG5leHBvcnRzLk1lbnUgPSBkZWZpbmVDb21wb25lbnQoJ01lbnUnLCBbJ3RyaWdnZXInXSwgdHJ1ZSk7XG5leHBvcnRzLk9uYm9hcmRpbmdWaWV3ID0gZGVmaW5lQ29tcG9uZW50KCdPbmJvYXJkaW5nVmlldycsIFsnZXJyb3InXSwgdHJ1ZSk7XG5leHBvcnRzLlBsYXRmb3JtQ29uZmlndXJhdGlvblZpZXcgPSBkZWZpbmVDb21wb25lbnQoJ1BsYXRmb3JtQ29uZmlndXJhdGlvblZpZXcnLCBbXSwgdHJ1ZSk7XG5leHBvcnRzLlByb3BlcnR5TGlzdEl0ZW0gPSBkZWZpbmVDb21wb25lbnQoJ1Byb3BlcnR5TGlzdEl0ZW0nLCBbJ2xhYmVsJywgJ3ZhbHVlJ10sIHRydWUpO1xuZXhwb3J0cy5Qcm9wZXJ0eUxpc3QgPSBkZWZpbmVDb21wb25lbnQoJ1Byb3BlcnR5TGlzdCcsIFtdLCB0cnVlKTtcbmV4cG9ydHMuUmFkaW8gPSBkZWZpbmVDb21wb25lbnQoJ1JhZGlvJywgWydsYWJlbCddLCB0cnVlKTtcbmV4cG9ydHMuU2VsZWN0ID0gZGVmaW5lQ29tcG9uZW50KCdTZWxlY3QnLCBbJ2xhYmVsJ10sIHRydWUpO1xuZXhwb3J0cy5TZXR0aW5nc1ZpZXcgPSBkZWZpbmVDb21wb25lbnQoJ1NldHRpbmdzVmlldycsIFtdLCB0cnVlKTtcbmV4cG9ydHMuU2lnbkluVmlldyA9IGRlZmluZUNvbXBvbmVudCgnU2lnbkluVmlldycsIFsnZGVzY3JpcHRpb25BY3Rpb25Db250ZW50cycsICdmb290ZXJDb250ZW50J10sIHRydWUpO1xuZXhwb3J0cy5TcGFya2xpbmUgPSBkZWZpbmVDb21wb25lbnQoJ1NwYXJrbGluZScsIFtdLCB0cnVlKTtcbmV4cG9ydHMuU3Bpbm5lciA9IGRlZmluZUNvbXBvbmVudCgnU3Bpbm5lcicsIFtdLCB0cnVlKTtcbmV4cG9ydHMuU3RyaXBlRmlsZVVwbG9hZGVyID0gZGVmaW5lQ29tcG9uZW50KCdTdHJpcGVGaWxlVXBsb2FkZXInLCBbXSwgdHJ1ZSk7XG5leHBvcnRzLlN3aXRjaCA9IGRlZmluZUNvbXBvbmVudCgnU3dpdGNoJywgWydsYWJlbCddLCB0cnVlKTtcbmV4cG9ydHMuVGFiTGlzdCA9IGRlZmluZUNvbXBvbmVudCgnVGFiTGlzdCcsIFtdLCB0cnVlKTtcbmV4cG9ydHMuVGFiUGFuZWwgPSBkZWZpbmVDb21wb25lbnQoJ1RhYlBhbmVsJywgW10sIHRydWUpO1xuZXhwb3J0cy5UYWJQYW5lbHMgPSBkZWZpbmVDb21wb25lbnQoJ1RhYlBhbmVscycsIFtdLCB0cnVlKTtcbmV4cG9ydHMuVGFiID0gZGVmaW5lQ29tcG9uZW50KCdUYWInLCBbXSwgdHJ1ZSk7XG5leHBvcnRzLlRhYmxlQm9keSA9IGRlZmluZUNvbXBvbmVudCgnVGFibGVCb2R5JywgW10sIHRydWUpO1xuZXhwb3J0cy5UYWJsZUNlbGwgPSBkZWZpbmVDb21wb25lbnQoJ1RhYmxlQ2VsbCcsIFtdLCB0cnVlKTtcbmV4cG9ydHMuVGFibGVGb290ZXIgPSBkZWZpbmVDb21wb25lbnQoJ1RhYmxlRm9vdGVyJywgW10sIHRydWUpO1xuZXhwb3J0cy5UYWJsZUhlYWQgPSBkZWZpbmVDb21wb25lbnQoJ1RhYmxlSGVhZCcsIFtdLCB0cnVlKTtcbmV4cG9ydHMuVGFibGVIZWFkZXJDZWxsID0gZGVmaW5lQ29tcG9uZW50KCdUYWJsZUhlYWRlckNlbGwnLCBbXSwgdHJ1ZSk7XG5leHBvcnRzLlRhYmxlID0gZGVmaW5lQ29tcG9uZW50KCdUYWJsZScsIFtdLCB0cnVlKTtcbmV4cG9ydHMuVGFibGVSb3cgPSBkZWZpbmVDb21wb25lbnQoJ1RhYmxlUm93JywgW10sIHRydWUpO1xuZXhwb3J0cy5UYWJzID0gZGVmaW5lQ29tcG9uZW50KCdUYWJzJywgW10sIHRydWUpO1xuZXhwb3J0cy5UYXNrTGlzdEl0ZW0gPSBkZWZpbmVDb21wb25lbnQoJ1Rhc2tMaXN0SXRlbScsIFtdLCB0cnVlKTtcbmV4cG9ydHMuVGFza0xpc3QgPSBkZWZpbmVDb21wb25lbnQoJ1Rhc2tMaXN0JywgW10sIHRydWUpO1xuZXhwb3J0cy5UZXh0QXJlYSA9IGRlZmluZUNvbXBvbmVudCgnVGV4dEFyZWEnLCBbJ2xhYmVsJ10sIHRydWUpO1xuZXhwb3J0cy5UZXh0RmllbGQgPSBkZWZpbmVDb21wb25lbnQoJ1RleHRGaWVsZCcsIFsnbGFiZWwnXSwgdHJ1ZSk7XG5leHBvcnRzLlRvb2x0aXAgPSBkZWZpbmVDb21wb25lbnQoJ1Rvb2x0aXAnLCBbJ3RyaWdnZXInXSwgdHJ1ZSk7XG4iLCAiLy8gQVVUT0dFTkVSQVRFRCAtIERPIE5PVCBNT0RJRllcbmltcG9ydCBOZXh1c092ZXJ2aWV3IGZyb20gJy4uL3NyYy92aWV3cy9OZXh1c092ZXJ2aWV3JztpbXBvcnQgUGF5bWVudE5leHVzRGV0YWlsIGZyb20gJy4uL3NyYy92aWV3cy9QYXltZW50TmV4dXNEZXRhaWwnO1xuXG5leHBvcnQgKiBmcm9tICdAc3RyaXBlL3VpLWV4dGVuc2lvbi1zZGsvdmVyc2lvbic7XG5leHBvcnQgY29uc3QgQlVJTERfVElNRSA9ICcyMDI2LTA0LTEyIDE1OjQzOjA1Ljc0NTA5ODIxMSAtMDQwMCBFRFQgbT0rNi4zNTcyMjAzNDInO1xuXG5leHBvcnQgeyBcbiAgTmV4dXNPdmVydmlldyxcblxuICBQYXltZW50TmV4dXNEZXRhaWxcbiB9O1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIFwiJHNjaGVtYVwiOiBcImh0dHBzOi8vc3RyaXBlLmNvbS9zdHJpcGUtYXBwLnNjaGVtYS5qc29uXCIsXG4gIFwiZGlzdHJpYnV0aW9uX3R5cGVcIjogXCJwdWJsaWNcIixcbiAgXCJpY29uXCI6IFwiLi9pY29uLnBuZ1wiLFxuICBcImlkXCI6IFwiY29tLnRheHNoaWVsZGFnZW50Lm1vbml0b3JcIixcbiAgXCJuYW1lXCI6IFwiVGF4U2hpZWxkQWdlbnRcIixcbiAgXCJwZXJtaXNzaW9uc1wiOiBbXG4gICAge1xuICAgICAgXCJwZXJtaXNzaW9uXCI6IFwicGF5bWVudF9pbnRlbnRfcmVhZFwiLFxuICAgICAgXCJwdXJwb3NlXCI6IFwiUmVhZCBQYXltZW50SW50ZW50IG1ldGFkYXRhIHRvIGV4dHJhY3QgdGhlIGRlc3RpbmF0aW9uIHN0YXRlIGZvciBlYWNoIHRyYW5zYWN0aW9uLCBlbmFibGluZyBwZXItc3RhdGUgc2FsZXMgYWdncmVnYXRpb24gYW5kIEVjb25vbWljIE5leHVzIHRocmVzaG9sZCBtb25pdG9yaW5nIGFjcm9zcyBhbGwgNTAgVVMgc3RhdGVzLlwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInBlcm1pc3Npb25cIjogXCJ0YXhfc2V0dGluZ3Nfd3JpdGVcIixcbiAgICAgIFwicHVycG9zZVwiOiBcIkNyZWF0ZSBTdHJpcGUgVGF4IFJlZ2lzdHJhdGlvbnMgaW4gVVMgc3RhdGVzIHdoZW4gYSBtZXJjaGFudCBhcHByb3ZlcyBhIGNvbXBsaWFuY2UgZml4LiBSZWdpc3RyYXRpb24gb25seSBvY2N1cnMgYWZ0ZXIgZXhwbGljaXQgbWVyY2hhbnQgY29uZmlybWF0aW9uIFx1MjAxNCB0aGUgYXBwIG5ldmVyIGFjdHMgYXV0b25vbW91c2x5LlwiXG4gICAgfSxcbiAgICB7XG4gICAgICBcInBlcm1pc3Npb25cIjogXCJjaGFyZ2Vfd3JpdGVcIixcbiAgICAgIFwicHVycG9zZVwiOiBcIkFwcGx5IGEgJDEgYXBwbGljYXRpb24gZmVlIHRvIHRoZSBtZXJjaGFudCdzIG1vc3QgcmVjZW50IGNoYXJnZSB3aGVuIGEgc3RhdGUgdGF4IHJlZ2lzdHJhdGlvbiBpcyBzdWNjZXNzZnVsbHkgY29tcGxldGVkLiBUaGlzIGlzIHRoZSBhcHAncyBwZXItYWN0aW9uIG1vbmV0aXNhdGlvbiBmZWUuXCJcbiAgICB9XG4gIF0sXG4gIFwicG9zdF9pbnN0YWxsX2FjdGlvblwiOiB7XG4gICAgXCJ0eXBlXCI6IFwiZXh0ZXJuYWxcIixcbiAgICBcInVybFwiOiBcImh0dHBzOi8vYXBpLnRheHNoaWVsZGFnZW50LmNvbS9zdHJpcGUtYXBwL3N0cmlwZS1hcHAtY2FsbGJhY2tcIlxuICB9LFxuICBcInVpX2V4dGVuc2lvblwiOiB7XG4gICAgXCJjb250ZW50X3NlY3VyaXR5X3BvbGljeVwiOiB7XG4gICAgICBcImNvbm5lY3Qtc3JjXCI6IFtcbiAgICAgICAgXCJodHRwczovL2FwaS50YXhzaGllbGRhZ2VudC5jb20vc3RyaXBlLWFwcC9cIixcbiAgICAgICAgXCJodHRwczovL2FwaS50YXhzaGllbGRhZ2VudC5jb20vbmV4dXMvXCJcbiAgICAgIF0sXG4gICAgICBcInB1cnBvc2VcIjogXCJDb25uZWN0IHRvIFRheFNoaWVsZEFnZW50IGJhY2tlbmQgQVBJIGZvciBuZXh1cyByaXNrIGRhdGEgYW5kIGNvbXBsaWFuY2UgYWN0aW9uc1wiXG4gICAgfSxcbiAgICBcInZpZXdzXCI6IFtcbiAgICAgIHtcbiAgICAgICAgXCJjb21wb25lbnRcIjogXCJOZXh1c092ZXJ2aWV3XCIsXG4gICAgICAgIFwidmlld3BvcnRcIjogXCJzdHJpcGUuZGFzaGJvYXJkLmhvbWUub3ZlcnZpZXdcIlxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgXCJjb21wb25lbnRcIjogXCJQYXltZW50TmV4dXNEZXRhaWxcIixcbiAgICAgICAgXCJ2aWV3cG9ydFwiOiBcInN0cmlwZS5kYXNoYm9hcmQucGF5bWVudC5kZXRhaWxcIlxuICAgICAgfVxuICAgIF1cbiAgfSxcbiAgXCJ2ZXJzaW9uXCI6IFwiMC40LjJcIlxufTtcbiIsICIvKipcbiAqIE5leHVzT3ZlcnZpZXcgXHUyMDE0IE1haW4gU3RyaXBlIERhc2hib2FyZCBwYW5lbCBmb3IgVGF4U2hpZWxkQWdlbnQuXG4gKlxuICogRGlzcGxheXMgbmV4dXMgcmlzayBzdW1tYXJ5IGFjcm9zcyBhbGwgY29ubmVjdGVkIHBsYXRmb3JtcyBhbmRcbiAqIHByb3ZpZGVzIG9uZS1jbGljayBzdGF0ZSB0YXggcmVnaXN0cmF0aW9uIGZvciAkMSBwZXIgc3RhdGUuXG4gKi9cblxuaW1wb3J0IHtcbiAgQm94LFxuICBJbmxpbmUsXG4gIEJhZGdlLFxuICBCdXR0b24sXG4gIEljb24sXG4gIExpc3QsXG4gIExpc3RJdGVtLFxuICBTcGlubmVyLFxuICBCYW5uZXIsXG59IGZyb20gXCJAc3RyaXBlL3VpLWV4dGVuc2lvbi1zZGsvdWlcIjtcbmltcG9ydCB0eXBlIHsgRXh0ZW5zaW9uQ29udGV4dFZhbHVlIH0gZnJvbSBcIkBzdHJpcGUvdWktZXh0ZW5zaW9uLXNkay9jb250ZXh0XCI7XG5pbXBvcnQgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VDYWxsYmFjayB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQkFDS0VORF9VUkwgfSBmcm9tIFwiLi4vY29uZmlnXCI7XG5cbmludGVyZmFjZSBOZXh1c1N0YXRlIHtcbiAgc3RhdGU6IHN0cmluZztcbiAgcmlza19sZXZlbDogc3RyaW5nO1xuICB0b3RhbF9zYWxlczogbnVtYmVyO1xuICB0aHJlc2hvbGQ6IG51bWJlcjtcbiAgcGN0OiBudW1iZXI7XG4gIGFsZXJ0X2lkOiBzdHJpbmcgfCBudWxsO1xufVxuXG5pbnRlcmZhY2UgTmV4dXNTdGF0dXNSZXNwb25zZSB7XG4gIGF0X3Jpc2tfY291bnQ6IG51bWJlcjtcbiAgY3JpdGljYWxfY291bnQ6IG51bWJlcjtcbiAgc3RhdGVzOiBOZXh1c1N0YXRlW107XG59XG5cbnR5cGUgQmFkZ2VUb25lID0gXCJjcml0aWNhbFwiIHwgXCJ3YXJuaW5nXCIgfCBcImluZm9cIjtcblxuZnVuY3Rpb24gcmlza0JhZGdlVG9uZShsZXZlbDogc3RyaW5nKTogQmFkZ2VUb25lIHtcbiAgc3dpdGNoIChsZXZlbCkge1xuICAgIGNhc2UgXCJDUklUSUNBTFwiOlxuICAgICAgcmV0dXJuIFwiY3JpdGljYWxcIjtcbiAgICBjYXNlIFwiUkVEXCI6XG4gICAgICByZXR1cm4gXCJjcml0aWNhbFwiO1xuICAgIGNhc2UgXCJZRUxMT1dcIjpcbiAgICAgIHJldHVybiBcIndhcm5pbmdcIjtcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIFwiaW5mb1wiO1xuICB9XG59XG5cbmNvbnN0IE5leHVzT3ZlcnZpZXcgPSAoe1xuICB1c2VyQ29udGV4dCxcbiAgZW52aXJvbm1lbnQsXG59OiBFeHRlbnNpb25Db250ZXh0VmFsdWUpID0+IHtcbiAgY29uc3QgW2xvYWRpbmcsIHNldExvYWRpbmddID0gdXNlU3RhdGUodHJ1ZSk7XG4gIGNvbnN0IFtkYXRhLCBzZXREYXRhXSA9IHVzZVN0YXRlPE5leHVzU3RhdHVzUmVzcG9uc2UgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW2Vycm9yLCBzZXRFcnJvcl0gPSB1c2VTdGF0ZTxzdHJpbmcgfCBudWxsPihudWxsKTtcbiAgY29uc3QgW2NvbmZpcm1pbmdTdGF0ZSwgc2V0Q29uZmlybWluZ1N0YXRlXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbZml4aW5nU3RhdGUsIHNldEZpeGluZ1N0YXRlXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbZml4ZWRTdGF0ZXMsIHNldEZpeGVkU3RhdGVzXSA9IHVzZVN0YXRlPFNldDxzdHJpbmc+PihuZXcgU2V0KCkpO1xuXG4gIGNvbnN0IGFjY291bnRJZCA9IHVzZXJDb250ZXh0Py5hY2NvdW50Py5pZCA/PyBcIlwiO1xuXG4gIGNvbnN0IGZldGNoTmV4dXNTdGF0dXMgPSB1c2VDYWxsYmFjayhhc3luYyAoKSA9PiB7XG4gICAgc2V0TG9hZGluZyh0cnVlKTtcbiAgICBzZXRFcnJvcihudWxsKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKGAke0JBQ0tFTkRfVVJMfS9zdHJpcGUtYXBwL25leHVzLXN1bW1hcnlgLCB7XG4gICAgICAgIGhlYWRlcnM6IHsgXCJYLVN0cmlwZS1BY2NvdW50XCI6IGFjY291bnRJZCB9LFxuICAgICAgfSk7XG4gICAgICBpZiAoIXJlc3Aub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBCYWNrZW5kIHJldHVybmVkICR7cmVzcC5zdGF0dXN9YCk7XG4gICAgICB9XG4gICAgICBjb25zdCBqc29uOiBOZXh1c1N0YXR1c1Jlc3BvbnNlID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gICAgICBzZXREYXRhKGpzb24pO1xuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgICBzZXRFcnJvcihlcnIubWVzc2FnZSB8fCBcIkZhaWxlZCB0byBsb2FkIG5leHVzIHN0YXR1c1wiKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgfVxuICB9LCBbYWNjb3VudElkXSk7XG5cbiAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICBpZiAoYWNjb3VudElkKSB7XG4gICAgICBmZXRjaE5leHVzU3RhdHVzKCk7XG4gICAgfVxuICB9LCBbYWNjb3VudElkLCBmZXRjaE5leHVzU3RhdHVzXSk7XG5cbiAgY29uc3QgaGFuZGxlQ29uZmlybUZpeCA9IGFzeW5jIChzdGF0ZTogTmV4dXNTdGF0ZSkgPT4ge1xuICAgIGlmICghc3RhdGUuYWxlcnRfaWQpIHJldHVybjtcbiAgICBzZXRGaXhpbmdTdGF0ZShzdGF0ZS5zdGF0ZSk7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3AgPSBhd2FpdCBmZXRjaChcbiAgICAgICAgYCR7QkFDS0VORF9VUkx9L2FsZXJ0cy8ke3N0YXRlLmFsZXJ0X2lkfS9jb25maXJtLWZpeGAsXG4gICAgICAgIHtcbiAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgICAgXCJYLVN0cmlwZS1BY2NvdW50XCI6IGFjY291bnRJZCxcbiAgICAgICAgICB9LFxuICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgIHVzZXJfY29uZmlybWVkOiB0cnVlLFxuICAgICAgICAgICAgc3RhdGU6IHN0YXRlLnN0YXRlLFxuICAgICAgICAgIH0pLFxuICAgICAgICB9XG4gICAgICApO1xuICAgICAgaWYgKCFyZXNwLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRml4IGZhaWxlZCB3aXRoIHN0YXR1cyAke3Jlc3Auc3RhdHVzfWApO1xuICAgICAgfVxuICAgICAgc2V0Rml4ZWRTdGF0ZXMoKHByZXYpID0+IG5ldyBTZXQocHJldikuYWRkKHN0YXRlLnN0YXRlKSk7XG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgIHNldEVycm9yKGBGaXggZmFpbGVkIGZvciAke3N0YXRlLnN0YXRlfTogJHtlcnIubWVzc2FnZX1gKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgc2V0Rml4aW5nU3RhdGUobnVsbCk7XG4gICAgICBzZXRDb25maXJtaW5nU3RhdGUobnVsbCk7XG4gICAgfVxuICB9O1xuXG4gIC8vIExvYWRpbmcgc3RhdGVcbiAgaWYgKGxvYWRpbmcpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEJveCBjc3M9e3sgcGFkZGluZzogXCJsYXJnZVwiLCBsYXlvdXQ6IFwiY29sdW1uXCIsIGFsaWduWDogXCJjZW50ZXJcIiB9fT5cbiAgICAgICAgPFNwaW5uZXIgLz5cbiAgICAgICAgPEJveCBjc3M9e3sgbWFyZ2luVG9wOiBcIm1lZGl1bVwiIH19PlxuICAgICAgICAgIExvYWRpbmcgbmV4dXMgc3RhdHVzLi4uXG4gICAgICAgIDwvQm94PlxuICAgICAgPC9Cb3g+XG4gICAgKTtcbiAgfVxuXG4gIC8vIEVycm9yIHN0YXRlXG4gIGlmIChlcnJvciAmJiAhZGF0YSkge1xuICAgIHJldHVybiAoXG4gICAgICA8Qm94IGNzcz17eyBwYWRkaW5nOiBcImxhcmdlXCIgfX0+XG4gICAgICAgIDxCYW5uZXJcbiAgICAgICAgICB0eXBlPVwiY3JpdGljYWxcIlxuICAgICAgICAgIHRpdGxlPVwiQ29ubmVjdGlvbiBFcnJvclwiXG4gICAgICAgICAgZGVzY3JpcHRpb249e2Vycm9yfVxuICAgICAgICAgIGFjdGlvbnM9e1xuICAgICAgICAgICAgPEJ1dHRvbiBvblByZXNzPXtmZXRjaE5leHVzU3RhdHVzfT5SZXRyeTwvQnV0dG9uPlxuICAgICAgICAgIH1cbiAgICAgICAgLz5cbiAgICAgIDwvQm94PlxuICAgICk7XG4gIH1cblxuICBjb25zdCBhdFJpc2tTdGF0ZXMgPSBkYXRhPy5zdGF0ZXMgPz8gW107XG4gIGNvbnN0IGhhc1Jpc2tzID0gYXRSaXNrU3RhdGVzLmxlbmd0aCA+IDA7XG5cbiAgcmV0dXJuIChcbiAgICA8Qm94IGNzcz17eyBwYWRkaW5nOiBcImxhcmdlXCIsIGxheW91dDogXCJjb2x1bW5cIiwgZ2FwOiBcIm1lZGl1bVwiIH19PlxuICAgICAgey8qIFN1bW1hcnkgYmFubmVyICovfVxuICAgICAgeyFoYXNSaXNrcyA/IChcbiAgICAgICAgPEJhbm5lclxuICAgICAgICAgIHR5cGU9XCJkZWZhdWx0XCJcbiAgICAgICAgICB0aXRsZT1cIkFsbCBDbGVhclwiXG4gICAgICAgICAgZGVzY3JpcHRpb249XCJObyBuZXh1cyByaXNrcyBkZXRlY3RlZCBhY3Jvc3MgeW91ciBjb25uZWN0ZWQgcGxhdGZvcm1zLlwiXG4gICAgICAgIC8+XG4gICAgICApIDogKFxuICAgICAgICA8QmFubmVyXG4gICAgICAgICAgdHlwZT1cImNyaXRpY2FsXCJcbiAgICAgICAgICB0aXRsZT17YCR7ZGF0YSEuYXRfcmlza19jb3VudH0gc3RhdGUke2RhdGEhLmF0X3Jpc2tfY291bnQgIT09IDEgPyBcInNcIiA6IFwiXCJ9IGF0IHJpc2tgfVxuICAgICAgICAgIGRlc2NyaXB0aW9uPXtcbiAgICAgICAgICAgIGRhdGEhLmNyaXRpY2FsX2NvdW50ID4gMFxuICAgICAgICAgICAgICA/IGAke2RhdGEhLmNyaXRpY2FsX2NvdW50fSByZXF1aXJlIGltbWVkaWF0ZSBhY3Rpb24gXHUyMDE0IHlvdSBtYXkgYWxyZWFkeSBvd2Ugc2FsZXMgdGF4LmBcbiAgICAgICAgICAgICAgOiBcIlJldmlldyB0aGUgc3RhdGVzIGJlbG93IGFuZCByZWdpc3RlciBiZWZvcmUgeW91IGNyb3NzIGEgdGhyZXNob2xkLlwiXG4gICAgICAgICAgfVxuICAgICAgICAvPlxuICAgICAgKX1cblxuICAgICAgey8qIEVycm9yIGJhbm5lciAobm9uLWZhdGFsKSAqL31cbiAgICAgIHtlcnJvciAmJiBkYXRhICYmIChcbiAgICAgICAgPEJhbm5lciB0eXBlPVwid2FybmluZ1wiIHRpdGxlPVwiV2FybmluZ1wiIGRlc2NyaXB0aW9uPXtlcnJvcn0gLz5cbiAgICAgICl9XG5cbiAgICAgIHsvKiBBdC1yaXNrIHN0YXRlIGxpc3QgKi99XG4gICAgICB7aGFzUmlza3MgJiYgKFxuICAgICAgICA8TGlzdD5cbiAgICAgICAgICB7YXRSaXNrU3RhdGVzLm1hcCgocykgPT4ge1xuICAgICAgICAgICAgY29uc3QgaXNGaXhlZCA9IGZpeGVkU3RhdGVzLmhhcyhzLnN0YXRlKTtcbiAgICAgICAgICAgIGNvbnN0IGlzQ29uZmlybWluZyA9IGNvbmZpcm1pbmdTdGF0ZSA9PT0gcy5zdGF0ZTtcbiAgICAgICAgICAgIGNvbnN0IGlzRml4aW5nID0gZml4aW5nU3RhdGUgPT09IHMuc3RhdGU7XG5cbiAgICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICAgIDxMaXN0SXRlbVxuICAgICAgICAgICAgICAgIGtleT17cy5zdGF0ZX1cbiAgICAgICAgICAgICAgICBpZD17cy5zdGF0ZX1cbiAgICAgICAgICAgICAgICB0aXRsZT17PElubGluZT57cy5zdGF0ZX08L0lubGluZT59XG4gICAgICAgICAgICAgICAgc2Vjb25kYXJ5VGl0bGU9e1xuICAgICAgICAgICAgICAgICAgPElubGluZT5cbiAgICAgICAgICAgICAgICAgICAgJHtzLnRvdGFsX3NhbGVzLnRvTG9jYWxlU3RyaW5nKCl9IC8gJFxuICAgICAgICAgICAgICAgICAgICB7cy50aHJlc2hvbGQudG9Mb2NhbGVTdHJpbmcoKX0gKHtzLnBjdC50b0ZpeGVkKDApfSUpXG4gICAgICAgICAgICAgICAgICA8L0lubGluZT5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFsdWU9e1xuICAgICAgICAgICAgICAgICAgPElubGluZSBjc3M9e3sgbGF5b3V0OiBcInJvd1wiLCBnYXA6IFwic21hbGxcIiwgYWxpZ25ZOiBcImNlbnRlclwiIH19PlxuICAgICAgICAgICAgICAgICAgICA8QmFkZ2UgdHlwZT17cmlza0JhZGdlVG9uZShzLnJpc2tfbGV2ZWwpfT5cbiAgICAgICAgICAgICAgICAgICAgICB7cy5yaXNrX2xldmVsfVxuICAgICAgICAgICAgICAgICAgICA8L0JhZGdlPlxuXG4gICAgICAgICAgICAgICAgICAgIHtpc0ZpeGVkID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxCYWRnZSB0eXBlPVwiaW5mb1wiPlJlZ2lzdGVyZWQ8L0JhZGdlPlxuICAgICAgICAgICAgICAgICAgICApIDogaXNDb25maXJtaW5nID8gKFxuICAgICAgICAgICAgICAgICAgICAgIDxJbmxpbmUgY3NzPXt7IGxheW91dDogXCJjb2x1bW5cIiwgZ2FwOiBcInhzbWFsbFwiIH19PlxuICAgICAgICAgICAgICAgICAgICAgICAgPEJveD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgUmVnaXN0ZXIgZm9yIHNhbGVzIHRheCBpbiB7cy5zdGF0ZX0/ICQxIGZlZSBhcHBsaWVzLlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9Cb3g+XG4gICAgICAgICAgICAgICAgICAgICAgICA8SW5saW5lIGNzcz17eyBsYXlvdXQ6IFwicm93XCIsIGdhcDogXCJ4c21hbGxcIiB9fT5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPEJ1dHRvblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblByZXNzPXsoKSA9PiBoYW5kbGVDb25maXJtRml4KHMpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtpc0ZpeGluZ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtpc0ZpeGluZyA/IFwiUHJvY2Vzc2luZy4uLlwiIDogXCJDb25maXJtXCJ9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIDwvQnV0dG9uPlxuICAgICAgICAgICAgICAgICAgICAgICAgICA8QnV0dG9uXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb25QcmVzcz17KCkgPT4gc2V0Q29uZmlybWluZ1N0YXRlKG51bGwpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXtpc0ZpeGluZ31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIENhbmNlbFxuICAgICAgICAgICAgICAgICAgICAgICAgICA8L0J1dHRvbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvSW5saW5lPlxuICAgICAgICAgICAgICAgICAgICAgIDwvSW5saW5lPlxuICAgICAgICAgICAgICAgICAgICApIDogKFxuICAgICAgICAgICAgICAgICAgICAgIDxCdXR0b25cbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU9XCJwcmltYXJ5XCJcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uUHJlc3M9eygpID0+IHNldENvbmZpcm1pbmdTdGF0ZShzLnN0YXRlKX1cbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkPXshcy5hbGVydF9pZH1cbiAgICAgICAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgICAgICBGSVggXHUyMDE0ICQxXG4gICAgICAgICAgICAgICAgICAgICAgPC9CdXR0b24+XG4gICAgICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgICA8L0lubGluZT5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIC8+XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pfVxuICAgICAgICA8L0xpc3Q+XG4gICAgICApfVxuXG4gICAgICB7LyogQ29ubmVjdCBtb3JlIHBsYXRmb3JtcyAqL31cbiAgICAgIDxCb3ggY3NzPXt7IG1hcmdpblRvcDogXCJtZWRpdW1cIiB9fT5cbiAgICAgICAgPEJ1dHRvblxuICAgICAgICAgIHR5cGU9XCJzZWNvbmRhcnlcIlxuICAgICAgICAgIGhyZWY9e2Ake0JBQ0tFTkRfVVJMfS9kYXNoYm9hcmRgfVxuICAgICAgICA+XG4gICAgICAgICAgQ29ubmVjdCBNb3JlIFBsYXRmb3Jtc1xuICAgICAgICA8L0J1dHRvbj5cbiAgICAgIDwvQm94PlxuICAgIDwvQm94PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgTmV4dXNPdmVydmlldztcbiIsICIvKipcbiAqIFRheFNoaWVsZEFnZW50IFN0cmlwZSBBcHAgXHUyMDE0IFJ1bnRpbWUgQ29uZmlndXJhdGlvblxuICpcbiAqIEJBQ0tFTkRfVVJMIGlzIHRoZSBvbmx5IHZhbHVlIHlvdSBuZWVkIHRvIGNoYW5nZSBiZXR3ZWVuIGRldiBhbmQgcHJvZHVjdGlvbi5cbiAqXG4gKiBEZXZlbG9wbWVudDogIHNldCB0byBcImh0dHA6Ly9sb2NhbGhvc3Q6ODAwMVwiICAobm90IGZvciBzdWJtaXNzaW9uKVxuICogUHJvZHVjdGlvbjogICBcImh0dHBzOi8vYXBpLnRheHNoaWVsZGFnZW50LmNvbVwiIChyZXF1aXJlZCBmb3IgU3RyaXBlIHJldmlldylcbiAqL1xuXG5leHBvcnQgY29uc3QgQkFDS0VORF9VUkwgPSBcImh0dHBzOi8vYXBpLnRheHNoaWVsZGFnZW50LmNvbVwiO1xuIiwgIi8qKlxuICogUGF5bWVudE5leHVzRGV0YWlsIFx1MjAxNCBTdHJpcGUgRGFzaGJvYXJkIHBheW1lbnQgZGV0YWlsIHBhbmVsLlxuICpcbiAqIFNob3dzIHRoZSBuZXh1cyBpbXBhY3Qgb2YgYSBzcGVjaWZpYyBwYXltZW50OiBvcmlnaW4gc3RhdGUsXG4gKiBjdW11bGF0aXZlIHNhbGVzIHZzIHRocmVzaG9sZCwgYW5kIHJpc2sgbGV2ZWwuXG4gKi9cblxuaW1wb3J0IHsgQm94LCBJbmxpbmUsIEJhZGdlLCBTcGlubmVyLCBCYW5uZXIgfSBmcm9tIFwiQHN0cmlwZS91aS1leHRlbnNpb24tc2RrL3VpXCI7XG5pbXBvcnQgdHlwZSB7IEV4dGVuc2lvbkNvbnRleHRWYWx1ZSB9IGZyb20gXCJAc3RyaXBlL3VpLWV4dGVuc2lvbi1zZGsvY29udGV4dFwiO1xuaW1wb3J0IHsgdXNlU3RhdGUsIHVzZUVmZmVjdCB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQkFDS0VORF9VUkwgfSBmcm9tIFwiLi4vY29uZmlnXCI7XG5cbnR5cGUgQmFkZ2VUb25lID0gXCJjcml0aWNhbFwiIHwgXCJ3YXJuaW5nXCIgfCBcImluZm9cIjtcblxuZnVuY3Rpb24gcmlza0JhZGdlVG9uZShsZXZlbDogc3RyaW5nKTogQmFkZ2VUb25lIHtcbiAgc3dpdGNoIChsZXZlbCkge1xuICAgIGNhc2UgXCJDUklUSUNBTFwiOlxuICAgIGNhc2UgXCJSRURcIjpcbiAgICAgIHJldHVybiBcImNyaXRpY2FsXCI7XG4gICAgY2FzZSBcIllFTExPV1wiOlxuICAgICAgcmV0dXJuIFwid2FybmluZ1wiO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gXCJpbmZvXCI7XG4gIH1cbn1cblxuY29uc3QgUGF5bWVudE5leHVzRGV0YWlsID0gKHtcbiAgdXNlckNvbnRleHQsXG4gIGVudmlyb25tZW50LFxufTogRXh0ZW5zaW9uQ29udGV4dFZhbHVlKSA9PiB7XG4gIGNvbnN0IFtsb2FkaW5nLCBzZXRMb2FkaW5nXSA9IHVzZVN0YXRlKHRydWUpO1xuICBjb25zdCBbZXJyb3IsIHNldEVycm9yXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbc3RhdGUsIHNldFN0YXRlXSA9IHVzZVN0YXRlPHN0cmluZyB8IG51bGw+KG51bGwpO1xuICBjb25zdCBbdG90YWxTYWxlcywgc2V0VG90YWxTYWxlc10gPSB1c2VTdGF0ZSgwKTtcbiAgY29uc3QgW3RocmVzaG9sZCwgc2V0VGhyZXNob2xkXSA9IHVzZVN0YXRlKDApO1xuICBjb25zdCBbcGN0LCBzZXRQY3RdID0gdXNlU3RhdGUoMCk7XG4gIGNvbnN0IFtyaXNrTGV2ZWwsIHNldFJpc2tMZXZlbF0gPSB1c2VTdGF0ZShcIkdSRUVOXCIpO1xuXG4gIGNvbnN0IGFjY291bnRJZCA9IHVzZXJDb250ZXh0Py5hY2NvdW50Py5pZCA/PyBcIlwiO1xuXG4gIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgaWYgKCFhY2NvdW50SWQpIHJldHVybjtcbiAgICAoYXN5bmMgKCkgPT4ge1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgcmVzcCA9IGF3YWl0IGZldGNoKGAke0JBQ0tFTkRfVVJMfS9zdHJpcGUtYXBwL25leHVzLXN1bW1hcnlgLCB7XG4gICAgICAgICAgaGVhZGVyczogeyBcIlgtU3RyaXBlLUFjY291bnRcIjogYWNjb3VudElkIH0sXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIXJlc3Aub2spIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEJhY2tlbmQgcmV0dXJuZWQgJHtyZXNwLnN0YXR1c31gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcC5qc29uKCk7XG4gICAgICAgIC8vIFNob3cgdGhlIGhpZ2hlc3QtcmlzayBzdGF0ZSBhcyByZXByZXNlbnRhdGl2ZSBmb3IgdGhpcyBwYXltZW50XG4gICAgICAgIGlmIChkYXRhLnN0YXRlcyAmJiBkYXRhLnN0YXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgY29uc3QgdG9wID0gZGF0YS5zdGF0ZXNbMF07XG4gICAgICAgICAgc2V0U3RhdGUodG9wLnN0YXRlKTtcbiAgICAgICAgICBzZXRUb3RhbFNhbGVzKHRvcC50b3RhbF9zYWxlcyA/PyAwKTtcbiAgICAgICAgICBzZXRUaHJlc2hvbGQodG9wLnRocmVzaG9sZCA/PyAwKTtcbiAgICAgICAgICBzZXRQY3QodG9wLnBjdCA/PyAwKTtcbiAgICAgICAgICBzZXRSaXNrTGV2ZWwodG9wLnJpc2tfbGV2ZWwgPz8gXCJHUkVFTlwiKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcbiAgICAgICAgc2V0RXJyb3IoZXJyLm1lc3NhZ2UgfHwgXCJGYWlsZWQgdG8gbG9hZCBuZXh1cyBkYXRhXCIpO1xuICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgc2V0TG9hZGluZyhmYWxzZSk7XG4gICAgICB9XG4gICAgfSkoKTtcbiAgfSwgW2FjY291bnRJZF0pO1xuXG4gIGlmIChsb2FkaW5nKSByZXR1cm4gPFNwaW5uZXIgLz47XG5cbiAgaWYgKGVycm9yKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxCb3ggY3NzPXt7IHBhZGRpbmc6IFwibWVkaXVtXCIgfX0+XG4gICAgICAgIDxCYW5uZXJcbiAgICAgICAgICB0eXBlPVwiY3JpdGljYWxcIlxuICAgICAgICAgIHRpdGxlPVwiQ291bGQgbm90IGxvYWQgbmV4dXMgZGF0YVwiXG4gICAgICAgICAgZGVzY3JpcHRpb249e2Vycm9yfVxuICAgICAgICAvPlxuICAgICAgPC9Cb3g+XG4gICAgKTtcbiAgfVxuXG4gIGlmICghc3RhdGUpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPEJveCBjc3M9e3sgcGFkZGluZzogXCJtZWRpdW1cIiB9fT5cbiAgICAgICAgTm8gbmV4dXMgcmlzayBkZXRlY3RlZCBmb3IgdGhpcyBwYXltZW50LlxuICAgICAgPC9Cb3g+XG4gICAgKTtcbiAgfVxuXG4gIHJldHVybiAoXG4gICAgPEJveCBjc3M9e3sgcGFkZGluZzogXCJtZWRpdW1cIiwgbGF5b3V0OiBcImNvbHVtblwiLCBnYXA6IFwic21hbGxcIiB9fT5cbiAgICAgIDxJbmxpbmUgY3NzPXt7IGZvbnRXZWlnaHQ6IFwiYm9sZFwiIH19PntzdGF0ZX08L0lubGluZT5cbiAgICAgIDxJbmxpbmU+XG4gICAgICAgICR7dG90YWxTYWxlcy50b0xvY2FsZVN0cmluZygpfSAvICR7dGhyZXNob2xkLnRvTG9jYWxlU3RyaW5nKCl9ICh7cGN0LnRvRml4ZWQoMCl9JSlcbiAgICAgIDwvSW5saW5lPlxuICAgICAgPEJhZGdlIHR5cGU9e3Jpc2tCYWRnZVRvbmUocmlza0xldmVsKX0+e3Jpc2tMZXZlbH08L0JhZGdlPlxuICAgIDwvQm94PlxuICApO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgUGF5bWVudE5leHVzRGV0YWlsO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQ0EsYUFBTyxlQUFlLFNBQVMsY0FBYyxFQUFFLE9BQU8sS0FBSyxDQUFDO0FBQzVELGNBQVEsY0FBYztBQUN0QixjQUFRLGNBQWM7QUFBQTtBQUFBOzs7QUNIdEI7QUFBQTtBQUFBO0FBQ0EsYUFBTyxlQUFlLFNBQVMsY0FBYyxFQUFFLE9BQU8sS0FBSyxDQUFDO0FBQzVELGNBQVEsa0JBQWtCLFFBQVEsWUFBWSxRQUFRLGNBQWMsUUFBUSxZQUFZLFFBQVEsWUFBWSxRQUFRLE1BQU0sUUFBUSxZQUFZLFFBQVEsV0FBVyxRQUFRLFVBQVUsUUFBUSxTQUFTLFFBQVEscUJBQXFCLFFBQVEsVUFBVSxRQUFRLFlBQVksUUFBUSxhQUFhLFFBQVEsZUFBZSxRQUFRLFNBQVMsUUFBUSxRQUFRLFFBQVEsZUFBZSxRQUFRLG1CQUFtQixRQUFRLDRCQUE0QixRQUFRLGlCQUFpQixRQUFRLE9BQU8sUUFBUSxXQUFXLFFBQVEsWUFBWSxRQUFRLE9BQU8sUUFBUSxXQUFXLFFBQVEsT0FBTyxRQUFRLFlBQVksUUFBUSxTQUFTLFFBQVEsTUFBTSxRQUFRLE9BQU8sUUFBUSxpQkFBaUIsUUFBUSxZQUFZLFFBQVEsVUFBVSxRQUFRLGtCQUFrQixRQUFRLHlCQUF5QixRQUFRLG1CQUFtQixRQUFRLFlBQVksUUFBUSxjQUFjLFFBQVEsT0FBTyxRQUFRLFdBQVcsUUFBUSxXQUFXLFFBQVEsU0FBUyxRQUFRLGNBQWMsUUFBUSxNQUFNLFFBQVEsV0FBVyxRQUFRLFNBQVMsUUFBUSxRQUFRLFFBQVEsWUFBWSxRQUFRLGdCQUFnQjtBQUNyL0IsY0FBUSxVQUFVLFFBQVEsWUFBWSxRQUFRLFdBQVcsUUFBUSxXQUFX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QUU7QUFBQSxZQUFHLElBQUksUUFBUSxDQUFDO0FBQUEsWUFBRTtBQUFBO0FBQUEsU0FDbEY7QUFBQSxRQUNBLDZDQUFDO0FBQUEsVUFBTSxNQUFNRixlQUFjLFNBQVM7QUFBQSxVQUFJO0FBQUEsU0FBVTtBQUFBO0FBQUEsS0FDcEQ7QUFBQSxFQUVKO0FBRUEsTUFBTyw2QkFBUTs7O0FIbEdmLCtCQUFjO0FBQ1AsTUFBTSxhQUFhO0FBUTFCLE1BQU8sbUJBQVE7QUFBQSxJQUNiLFdBQVc7QUFBQSxJQUNYLHFCQUFxQjtBQUFBLElBQ3JCLFFBQVE7QUFBQSxJQUNSLE1BQU07QUFBQSxJQUNOLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxNQUNiO0FBQUEsUUFDRSxjQUFjO0FBQUEsUUFDZCxXQUFXO0FBQUEsTUFDYjtBQUFBLE1BQ0E7QUFBQSxRQUNFLGNBQWM7QUFBQSxRQUNkLFdBQVc7QUFBQSxNQUNiO0FBQUEsTUFDQTtBQUFBLFFBQ0UsY0FBYztBQUFBLFFBQ2QsV0FBVztBQUFBLE1BQ2I7QUFBQSxJQUNGO0FBQUEsSUFDQSx1QkFBdUI7QUFBQSxNQUNyQixRQUFRO0FBQUEsTUFDUixPQUFPO0FBQUEsSUFDVDtBQUFBLElBQ0EsZ0JBQWdCO0FBQUEsTUFDZCwyQkFBMkI7QUFBQSxRQUN6QixlQUFlO0FBQUEsVUFDYjtBQUFBLFVBQ0E7QUFBQSxRQUNGO0FBQUEsUUFDQSxXQUFXO0FBQUEsTUFDYjtBQUFBLE1BQ0EsU0FBUztBQUFBLFFBQ1A7QUFBQSxVQUNFLGFBQWE7QUFBQSxVQUNiLFlBQVk7QUFBQSxRQUNkO0FBQUEsUUFDQTtBQUFBLFVBQ0UsYUFBYTtBQUFBLFVBQ2IsWUFBWTtBQUFBLFFBQ2Q7QUFBQSxNQUNGO0FBQUEsSUFDRjtBQUFBLElBQ0EsV0FBVztBQUFBLEVBQ2I7IiwKICAibmFtZXMiOiBbImltcG9ydF91aSIsICJpbXBvcnRfcmVhY3QiLCAiaW1wb3J0X2pzeF9ydW50aW1lIiwgInJpc2tCYWRnZVRvbmUiLCAiX2EiLCAiX2IiXQp9Cg==
