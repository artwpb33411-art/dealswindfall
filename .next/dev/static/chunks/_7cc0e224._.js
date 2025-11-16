(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/components/admin/DealsForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DealsForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function DealsForm() {
    _s();
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        description: "",
        currentPrice: "",
        oldPrice: "",
        storeName: "",
        imageLink: "",
        productLink: "",
        reviewLink: "",
        couponCode: "",
        shippingCost: "",
        notes: "",
        expireDate: "",
        category: "",
        holidayTag: ""
    });
    const HOLIDAY_TAGS = [
        "",
        "Black Friday",
        "Cyber Monday",
        "Thanksgiving Week",
        "Christmas & Holiday",
        "New Year",
        "Back to School",
        "Prime Day",
        "Memorial Day",
        "Labor Day",
        "Independence Day",
        "Spring Sale",
        "Clearance Event"
    ];
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [msg, setMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [productUrl, setProductUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [fetching, setFetching] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const onChange = (e)=>setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    // 🧠 Auto-fetch logic (Amazon/Walmart)
    const handleAutoFetch = async ()=>{
        if (!productUrl) return alert("Please paste a product link first.");
        setFetching(true);
        setMsg(null);
        try {
            const res = await fetch("/api/scrape", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url: productUrl
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to fetch product data");
            // 🧩 Populate fields dynamically
            setForm((prev)=>({
                    ...prev,
                    description: data.title || prev.description,
                    storeName: data.store || prev.storeName,
                    category: data.category || prev.category,
                    imageLink: data.image || prev.imageLink,
                    productLink: productUrl,
                    currentPrice: data.price?.replace(/[^0-9.]/g, "") || prev.currentPrice
                }));
            setMsg("✅ Product info fetched successfully!");
        } catch (err) {
            console.error("❌ Fetch error:", err);
            setMsg(`❌ ${err.message}`);
        } finally{
            setFetching(false);
        }
    };
    const onSubmit = async (e)=>{
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        try {
            const res = await fetch("/api/deals", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...form,
                    expireDate: form.expireDate ? form.expireDate : null,
                    published_at: new Date().toISOString()
                })
            });
            const data = await res.json();
            setSaving(false);
            if (!res.ok) {
                console.error("API error:", data);
                setMsg(`❌ ${data.error || "Failed to save"}`);
            } else {
                console.log("✅ Deal saved:", data);
                setMsg("✅ Deal saved successfully!");
                setForm({
                    description: "",
                    currentPrice: "",
                    oldPrice: "",
                    storeName: "",
                    imageLink: "",
                    productLink: "",
                    reviewLink: "",
                    couponCode: "",
                    shippingCost: "",
                    notes: "",
                    expireDate: "",
                    category: ""
                });
                setProductUrl("");
            }
        } catch (err) {
            console.error("Network error:", err);
            setMsg("❌ Network error");
            setSaving(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: onSubmit,
        className: "bg-white shadow p-6 rounded-md space-y-4 max-w-2xl border border-gray-300",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-xl font-semibold text-blue-600 mb-2",
                children: "Add New Deal"
            }, void 0, false, {
                fileName: "[project]/components/admin/DealsForm.tsx",
                lineNumber: 135,
                columnNumber: 7
            }, this),
            msg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-sm",
                children: msg
            }, void 0, false, {
                fileName: "[project]/components/admin/DealsForm.tsx",
                lineNumber: 138,
                columnNumber: 15
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex gap-2 items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "url",
                        placeholder: "Paste Amazon / Walmart product link...",
                        value: productUrl,
                        onChange: (e)=>setProductUrl(e.target.value),
                        className: "border p-2 rounded flex-1"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/DealsForm.tsx",
                        lineNumber: 142,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: handleAutoFetch,
                        disabled: fetching,
                        className: `px-4 py-2 rounded text-white ${fetching ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`,
                        children: fetching ? "Fetching..." : "Fetch"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/DealsForm.tsx",
                        lineNumber: 149,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/admin/DealsForm.tsx",
                lineNumber: 141,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                name: "description",
                value: form.description,
                onChange: onChange,
                placeholder: "Description",
                className: "input"
            }, void 0, false, {
                fileName: "[project]/components/admin/DealsForm.tsx",
                lineNumber: 162,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        name: "currentPrice",
                        value: form.currentPrice,
                        onChange: onChange,
                        placeholder: "Current Price",
                        className: "input"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/DealsForm.tsx",
                        lineNumber: 170,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        name: "oldPrice",
                        value: form.oldPrice,
                        onChange: onChange,
                        placeholder: "Old Price",
                        className: "input"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/DealsForm.tsx",
                        lineNumber: 177,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        name: "storeName",
                        value: form.storeName,
                        onChange: onChange,
                        placeholder: "Store Name",
                        className: "input"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/DealsForm.tsx",
                        lineNumber: 184,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/admin/DealsForm.tsx",
                lineNumber: 169,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                name: "imageLink",
                value: form.imageLink,
                onChange: onChange,
                placeholder: "Image Link",
                className: "input"
            }, void 0, false, {
                fileName: "[project]/components/admin/DealsForm.tsx",
                lineNumber: 193,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                name: "productLink",
                value: form.productLink,
                onChange: onChange,
                placeholder: "Product Link",
                className: "input"
            }, void 0, false, {
                fileName: "[project]/components/admin/DealsForm.tsx",
                lineNumber: 200,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                name: "reviewLink",
                value: form.reviewLink,
                onChange: onChange,
                placeholder: "Review Link",
                className: "input"
            }, void 0, false, {
                fileName: "[project]/components/admin/DealsForm.tsx",
                lineNumber: 207,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                name: "couponCode",
                value: form.couponCode,
                onChange: onChange,
                placeholder: "Coupon Code",
                className: "input"
            }, void 0, false, {
                fileName: "[project]/components/admin/DealsForm.tsx",
                lineNumber: 214,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                name: "shippingCost",
                value: form.shippingCost,
                onChange: onChange,
                placeholder: "Shipping Cost",
                className: "input"
            }, void 0, false, {
                fileName: "[project]/components/admin/DealsForm.tsx",
                lineNumber: 221,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                name: "notes",
                value: form.notes,
                onChange: onChange,
                placeholder: "Notes (bullet points)",
                className: "input"
            }, void 0, false, {
                fileName: "[project]/components/admin/DealsForm.tsx",
                lineNumber: 228,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                name: "expireDate",
                value: form.expireDate,
                onChange: onChange,
                placeholder: "Deal Expiry Date",
                className: "input"
            }, void 0, false, {
                fileName: "[project]/components/admin/DealsForm.tsx",
                lineNumber: 235,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                name: "category",
                value: form.category,
                onChange: onChange,
                placeholder: "Category",
                className: "input"
            }, void 0, false, {
                fileName: "[project]/components/admin/DealsForm.tsx",
                lineNumber: 242,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                name: "holidayTag",
                value: form.holidayTag,
                onChange: onChange,
                className: "input",
                children: HOLIDAY_TAGS.map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                        value: tag,
                        children: tag === "" ? "No holiday / event" : tag
                    }, tag, false, {
                        fileName: "[project]/components/admin/DealsForm.tsx",
                        lineNumber: 257,
                        columnNumber: 5
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/admin/DealsForm.tsx",
                lineNumber: 250,
                columnNumber: 1
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "submit",
                disabled: saving,
                className: "w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition",
                children: saving ? "Saving..." : "Save Deal"
            }, void 0, false, {
                fileName: "[project]/components/admin/DealsForm.tsx",
                lineNumber: 262,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/admin/DealsForm.tsx",
        lineNumber: 131,
        columnNumber: 5
    }, this);
}
_s(DealsForm, "+xtjGKy21LFWQpvsS5YVbplJAOI=");
_c = DealsForm;
var _c;
__turbopack_context__.k.register(_c, "DealsForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/admin/CatalogForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CatalogForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function CatalogForm() {
    _s();
    const [catalog, setCatalog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        storeName: "",
        startDate: "",
        endDate: "",
        catalogLink: "",
        screenshotLink: "",
        pdfFile: null
    });
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [msg, setMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleChange = (e)=>{
        const { name, value, files } = e.target;
        if (files) {
            setCatalog({
                ...catalog,
                [name]: files[0]
            });
        } else {
            setCatalog({
                ...catalog,
                [name]: value
            });
        }
    };
    const onSubmit = async (e)=>{
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        try {
            const res = await fetch("/api/catalogs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...catalog,
                    published_at: new Date().toISOString()
                })
            });
            const data = await res.json();
            setSaving(false);
            if (!res.ok) {
                setMsg(`❌ ${data.error || "Failed to upload"}`);
            } else {
                setMsg("✅ Catalog uploaded successfully!");
            }
        } catch (err) {
            console.error("Network error:", err);
            setMsg("❌ Network error");
            setSaving(false);
        }
    };
    // ✅ Return statement now correctly inside the component
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: onSubmit,
        className: "space-y-4",
        children: [
            msg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-sm",
                children: msg
            }, void 0, false, {
                fileName: "[project]/components/admin/CatalogForm.tsx",
                lineNumber: 59,
                columnNumber: 15
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        name: "storeName",
                        placeholder: "Store Name",
                        className: "border border-gray-300 rounded-md p-2",
                        value: catalog.storeName,
                        onChange: handleChange
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CatalogForm.tsx",
                        lineNumber: 62,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "block text-sm font-medium text-gray-700 mb-1",
                                        children: "Start Date"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CatalogForm.tsx",
                                        lineNumber: 71,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "date",
                                        name: "startDate",
                                        value: catalog.startDate,
                                        onChange: handleChange,
                                        className: "w-full border border-gray-300 rounded-md p-2"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CatalogForm.tsx",
                                        lineNumber: 74,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/admin/CatalogForm.tsx",
                                lineNumber: 70,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                className: "flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "block text-sm font-medium text-gray-700 mb-1",
                                        children: "End Date"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CatalogForm.tsx",
                                        lineNumber: 83,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "date",
                                        name: "endDate",
                                        value: catalog.endDate,
                                        onChange: handleChange,
                                        className: "w-full border border-gray-300 rounded-md p-2"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CatalogForm.tsx",
                                        lineNumber: 86,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/admin/CatalogForm.tsx",
                                lineNumber: 82,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/admin/CatalogForm.tsx",
                        lineNumber: 69,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/admin/CatalogForm.tsx",
                lineNumber: 61,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                name: "catalogLink",
                placeholder: "Catalog Link (URL)",
                className: "border border-gray-300 rounded-md p-2 w-full",
                value: catalog.catalogLink,
                onChange: handleChange
            }, void 0, false, {
                fileName: "[project]/components/admin/CatalogForm.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                name: "screenshotLink",
                placeholder: "Screenshot Link (optional)",
                className: "border border-gray-300 rounded-md p-2 w-full",
                value: catalog.screenshotLink,
                onChange: handleChange
            }, void 0, false, {
                fileName: "[project]/components/admin/CatalogForm.tsx",
                lineNumber: 105,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-sm font-medium mb-1",
                        children: "Upload Catalog (PDF)"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CatalogForm.tsx",
                        lineNumber: 114,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "file",
                        name: "pdfFile",
                        accept: ".pdf",
                        onChange: handleChange,
                        className: "border border-gray-300 rounded-md p-2 w-full"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CatalogForm.tsx",
                        lineNumber: 117,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/admin/CatalogForm.tsx",
                lineNumber: 113,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "submit",
                disabled: saving,
                className: "px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition",
                children: saving ? "Uploading..." : "Upload Catalog"
            }, void 0, false, {
                fileName: "[project]/components/admin/CatalogForm.tsx",
                lineNumber: 126,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/admin/CatalogForm.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_s(CatalogForm, "9LuR4TLVPqDnYuXLBRxGMMGSZSU=");
_c = CatalogForm;
var _c;
__turbopack_context__.k.register(_c, "CatalogForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/admin/CouponForm.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CouponForm
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function CouponForm() {
    _s();
    const [coupon, setCoupon] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        storeName: "",
        couponLink: "",
        expirationDate: "",
        couponFile: null
    });
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [msg, setMsg] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleChange = (e)=>{
        const { name, value, files } = e.target;
        if (files) {
            setCoupon({
                ...coupon,
                [name]: files[0]
            });
        } else {
            setCoupon({
                ...coupon,
                [name]: value
            });
        }
    };
    const onSubmit = async (e)=>{
        e.preventDefault();
        setSaving(true);
        setMsg(null);
        try {
            const res = await fetch("/api/coupons", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ...coupon,
                    published_at: new Date().toISOString()
                })
            });
            const data = await res.json();
            setSaving(false);
            if (!res.ok) {
                setMsg(`❌ ${data.error || "Failed to save"}`);
            } else {
                setMsg("✅ Coupon saved successfully!");
            }
        } catch (err) {
            console.error("Network error:", err);
            setMsg("❌ Network error");
            setSaving(false);
        }
    };
    // ✅ Return now correctly inside the component
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
        onSubmit: onSubmit,
        className: "space-y-4",
        children: [
            msg && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-sm",
                children: msg
            }, void 0, false, {
                fileName: "[project]/components/admin/CouponForm.tsx",
                lineNumber: 57,
                columnNumber: 15
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        name: "storeName",
                        placeholder: "Store Name",
                        className: "border border-gray-300 rounded-md p-2",
                        value: coupon.storeName,
                        onChange: handleChange
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CouponForm.tsx",
                        lineNumber: 60,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        name: "couponLink",
                        placeholder: "Coupon Link (PDF URL)",
                        className: "border border-gray-300 rounded-md p-2",
                        value: coupon.couponLink,
                        onChange: handleChange
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CouponForm.tsx",
                        lineNumber: 67,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/admin/CouponForm.tsx",
                lineNumber: 59,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-sm font-medium mb-1",
                        children: "Upload Coupon (PDF)"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CouponForm.tsx",
                        lineNumber: 77,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "file",
                        name: "couponFile",
                        accept: ".pdf",
                        onChange: handleChange,
                        className: "border border-gray-300 rounded-md p-2 w-full"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CouponForm.tsx",
                        lineNumber: 80,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/admin/CouponForm.tsx",
                lineNumber: 76,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "block text-sm font-medium mb-1",
                        children: "Expiration Date"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CouponForm.tsx",
                        lineNumber: 90,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "date",
                        name: "expirationDate",
                        value: coupon.expirationDate,
                        onChange: handleChange,
                        className: "border border-gray-300 rounded-md p-2 w-full"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CouponForm.tsx",
                        lineNumber: 93,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/admin/CouponForm.tsx",
                lineNumber: 89,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "submit",
                disabled: saving,
                className: "px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition",
                children: saving ? "Saving..." : "Save Coupon"
            }, void 0, false, {
                fileName: "[project]/components/admin/CouponForm.tsx",
                lineNumber: 102,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/admin/CouponForm.tsx",
        lineNumber: 56,
        columnNumber: 5
    }, this);
}
_s(CouponForm, "HVcVQPCmojYbDa+Zcbwju7ufqB0=");
_c = CouponForm;
var _c;
__turbopack_context__.k.register(_c, "CouponForm");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/constants/holidays.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "HOLIDAY_TAGS",
    ()=>HOLIDAY_TAGS
]);
const HOLIDAY_TAGS = [
    "",
    "Black Friday",
    "Cyber Monday",
    "Thanksgiving Week",
    "Christmas & Holiday",
    "New Year",
    "Back to School",
    "Prime Day"
];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/admin/DealsList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>DealsList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$holidays$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/constants/holidays.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function DealsList() {
    _s();
    const [deals, setDeals] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const toggleStatus = async (deal)=>{
        const newStatus = deal.status === "Published" ? "Draft" : "Published";
        try {
            const res = await fetch("/api/deals", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: deal.id,
                    status: newStatus
                })
            });
            const data = await res.json();
            if (res.ok) {
                setDeals((prev)=>prev.map((d)=>d.id === deal.id ? {
                            ...d,
                            status: newStatus
                        } : d));
            } else {
                alert(`❌ ${data.error || "Failed to update status"}`);
            }
        } catch (e) {
            alert(`❌ ${e.message}`);
        }
    };
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // 🔍 Filters
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [storeFilter, setStoreFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [categoryFilter, setCategoryFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [dateFilter, setDateFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // ↕️ Sorting
    const [sortField, setSortField] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("published_at");
    const [sortOrder, setSortOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("desc");
    // 📄 Pagination
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const rowsPerPage = 20;
    // ✏️ Edit Modal
    const [isModalOpen, setIsModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editDeal, setEditDeal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const fetchDeals = async ()=>{
        setLoading(true);
        try {
            const res = await fetch("/api/deals");
            const data = await res.json();
            console.log("🔍 Deals API response:", data); // 👈 add this line
            if (res.ok) setDeals(data);
            else setError(data.error || "Failed to load deals");
        } catch (e) {
            console.error("❌ Fetch failed:", e);
            setError(e.message);
        } finally{
            setLoading(false);
        }
    };
    const handleDelete = async (id)=>{
        if (!confirm("Are you sure you want to delete this deal?")) return;
        try {
            const res = await fetch("/api/deals", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id
                })
            });
            const data = await res.json();
            if (res.ok) {
                setDeals(deals.filter((d)=>d.id !== id));
            } else {
                alert(`❌ ${data.error || "Failed to delete"}`);
            }
        } catch (e) {
            alert(`❌ ${e.message}`);
        }
    };
    const handleEdit = (deal)=>{
        setEditDeal(deal);
        setIsModalOpen(true);
    };
    const handleSave = async ()=>{
        if (!editDeal) return;
        setSaving(true);
        try {
            const res = await fetch("/api/deals", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: editDeal.id,
                    description: editDeal.description,
                    store_name: editDeal.store_name,
                    category: editDeal.category,
                    old_price: editDeal.old_price,
                    current_price: editDeal.current_price,
                    price_diff: editDeal.price_diff,
                    percent_diff: editDeal.percent_diff,
                    deal_level: editDeal.deal_level,
                    product_link: editDeal.product_link,
                    image_link: editDeal.image_link,
                    review_link: editDeal.review_link,
                    coupon_code: editDeal.coupon_code,
                    shipping_cost: editDeal.shipping_cost,
                    notes: editDeal.notes,
                    holiday_tag: editDeal.holiday_tag ?? null
                })
            });
            const data = await res.json();
            if (res.ok) {
                setDeals((prev)=>prev.map((d)=>d.id === editDeal.id ? data.updated : d));
                setIsModalOpen(false);
            } else {
                alert(`❌ ${data.error || "Failed to update"}`);
            }
        } catch (e) {
            alert(`❌ ${e.message}`);
        } finally{
            setSaving(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "DealsList.useEffect": ()=>{
            fetchDeals();
        }
    }["DealsList.useEffect"], []);
    // 🧮 Filtered + Sorted deals
    const filteredDeals = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "DealsList.useMemo[filteredDeals]": ()=>{
            let result = deals.filter({
                "DealsList.useMemo[filteredDeals].result": (deal)=>{
                    const matchesSearch = search === "" || deal.description?.toLowerCase().includes(search.toLowerCase());
                    const matchesStore = storeFilter === "" || deal.store_name?.toLowerCase() === storeFilter.toLowerCase();
                    const matchesCategory = categoryFilter === "" || deal.category?.toLowerCase() === categoryFilter.toLowerCase();
                    const matchesDate = dateFilter === "" || deal.published_at && new Date(deal.published_at).toISOString().split("T")[0] >= dateFilter;
                    return matchesSearch && matchesStore && matchesCategory && matchesDate;
                }
            }["DealsList.useMemo[filteredDeals].result"]);
            result.sort({
                "DealsList.useMemo[filteredDeals]": (a, b)=>{
                    const valA = a[sortField];
                    const valB = b[sortField];
                    if (valA == null || valB == null) return 0;
                    if (sortField === "published_at") {
                        const dateA = new Date(valA).getTime();
                        const dateB = new Date(valB).getTime();
                        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
                    }
                    if (typeof valA === "string") {
                        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
                    }
                    return sortOrder === "asc" ? valA - valB : valB - valA;
                }
            }["DealsList.useMemo[filteredDeals]"]);
            return result;
        }
    }["DealsList.useMemo[filteredDeals]"], [
        deals,
        search,
        storeFilter,
        categoryFilter,
        dateFilter,
        sortField,
        sortOrder
    ]);
    // Pagination
    const totalPages = Math.ceil(filteredDeals.length / rowsPerPage);
    const paginatedDeals = filteredDeals.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    const storeNames = Array.from(new Set(deals.map((d)=>d.store_name))).filter(Boolean);
    const categories = Array.from(new Set(deals.map((d)=>d.category))).filter(Boolean);
    const resetFilters = ()=>{
        setSearch("");
        setStoreFilter("");
        setCategoryFilter("");
        setDateFilter("");
        setSortField("published_at");
        setSortOrder("desc");
        setPage(1);
    };
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "text-gray-600",
        children: "Loading deals..."
    }, void 0, false, {
        fileName: "[project]/components/admin/DealsList.tsx",
        lineNumber: 212,
        columnNumber: 23
    }, this);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "text-red-500",
        children: error
    }, void 0, false, {
        fileName: "[project]/components/admin/DealsList.tsx",
        lineNumber: 213,
        columnNumber: 21
    }, this);
    //console.log("✅ DealsList component reached render with", deals.length, "deals");
    //console.log("🔹 Filtered:", filteredDeals.length, "Paginated:", paginatedDeals.length);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-6 flex flex-col flex-grow bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden",
        style: {
            minHeight: "400px"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-grow overflow-auto custom-scroll p-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl font-semibold text-blue-600 mb-3",
                        children: "All Published Deals"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/DealsList.tsx",
                        lineNumber: 224,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-3 mb-4 items-center",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "Search description...",
                                className: "border rounded-md p-2 flex-1 min-w-[200px]",
                                value: search,
                                onChange: (e)=>setSearch(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/components/admin/DealsList.tsx",
                                lineNumber: 231,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "border rounded-md p-2",
                                value: storeFilter,
                                onChange: (e)=>setStoreFilter(e.target.value),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "All Stores"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/DealsList.tsx",
                                        lineNumber: 244,
                                        columnNumber: 11
                                    }, this),
                                    storeNames.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: s,
                                            children: s
                                        }, s, false, {
                                            fileName: "[project]/components/admin/DealsList.tsx",
                                            lineNumber: 246,
                                            columnNumber: 13
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/admin/DealsList.tsx",
                                lineNumber: 239,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "border rounded-md p-2",
                                value: categoryFilter,
                                onChange: (e)=>setCategoryFilter(e.target.value),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "",
                                        children: "All Categories"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/DealsList.tsx",
                                        lineNumber: 257,
                                        columnNumber: 11
                                    }, this),
                                    categories.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: c,
                                            children: c
                                        }, c, false, {
                                            fileName: "[project]/components/admin/DealsList.tsx",
                                            lineNumber: 259,
                                            columnNumber: 13
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/admin/DealsList.tsx",
                                lineNumber: 252,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "date",
                                className: "border rounded-md p-2",
                                value: dateFilter,
                                onChange: (e)=>setDateFilter(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/components/admin/DealsList.tsx",
                                lineNumber: 265,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "border rounded-md p-2",
                                value: sortField,
                                onChange: (e)=>setSortField(e.target.value),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "published_at",
                                        children: "Sort by Date"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/DealsList.tsx",
                                        lineNumber: 278,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "percent_diff",
                                        children: "Sort by Discount %"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/DealsList.tsx",
                                        lineNumber: 279,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "current_price",
                                        children: "Sort by Current Price"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/DealsList.tsx",
                                        lineNumber: 280,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "store_name",
                                        children: "Sort by Store"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/DealsList.tsx",
                                        lineNumber: 281,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/admin/DealsList.tsx",
                                lineNumber: 273,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                className: "border rounded-md p-2",
                                value: sortOrder,
                                onChange: (e)=>setSortOrder(e.target.value),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "desc",
                                        children: "Descending"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/DealsList.tsx",
                                        lineNumber: 289,
                                        columnNumber: 11
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                        value: "asc",
                                        children: "Ascending"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/DealsList.tsx",
                                        lineNumber: 290,
                                        columnNumber: 11
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/admin/DealsList.tsx",
                                lineNumber: 284,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: fetchDeals,
                                className: "px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700",
                                children: "Refresh"
                            }, void 0, false, {
                                fileName: "[project]/components/admin/DealsList.tsx",
                                lineNumber: 293,
                                columnNumber: 9
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: resetFilters,
                                className: "px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400",
                                children: "Reset"
                            }, void 0, false, {
                                fileName: "[project]/components/admin/DealsList.tsx",
                                lineNumber: 300,
                                columnNumber: 9
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/admin/DealsList.tsx",
                        lineNumber: 230,
                        columnNumber: 7
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "overflow-x-auto border border-gray-200 rounded-md mt-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "min-w-full text-sm text-gray-700",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    className: "bg-gray-100 text-left",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "p-2",
                                                children: "Description"
                                            }, void 0, false, {
                                                fileName: "[project]/components/admin/DealsList.tsx",
                                                lineNumber: 313,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "p-2",
                                                children: "Store"
                                            }, void 0, false, {
                                                fileName: "[project]/components/admin/DealsList.tsx",
                                                lineNumber: 314,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "p-2",
                                                children: "Category"
                                            }, void 0, false, {
                                                fileName: "[project]/components/admin/DealsList.tsx",
                                                lineNumber: 315,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "p-2",
                                                children: "Current"
                                            }, void 0, false, {
                                                fileName: "[project]/components/admin/DealsList.tsx",
                                                lineNumber: 316,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "p-2",
                                                children: "Old"
                                            }, void 0, false, {
                                                fileName: "[project]/components/admin/DealsList.tsx",
                                                lineNumber: 317,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "p-2",
                                                children: "Discount %"
                                            }, void 0, false, {
                                                fileName: "[project]/components/admin/DealsList.tsx",
                                                lineNumber: 318,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "p-2",
                                                children: "Published"
                                            }, void 0, false, {
                                                fileName: "[project]/components/admin/DealsList.tsx",
                                                lineNumber: 319,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "p-2",
                                                children: "Status"
                                            }, void 0, false, {
                                                fileName: "[project]/components/admin/DealsList.tsx",
                                                lineNumber: 320,
                                                columnNumber: 9
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "p-2 text-right",
                                                children: "Actions"
                                            }, void 0, false, {
                                                fileName: "[project]/components/admin/DealsList.tsx",
                                                lineNumber: 321,
                                                columnNumber: 9
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/admin/DealsList.tsx",
                                        lineNumber: 312,
                                        columnNumber: 7
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/DealsList.tsx",
                                    lineNumber: 311,
                                    columnNumber: 5
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    children: paginatedDeals.length > 0 ? paginatedDeals.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "border-t hover:bg-gray-50 transition",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "p-2",
                                                    children: d.description
                                                }, void 0, false, {
                                                    fileName: "[project]/components/admin/DealsList.tsx",
                                                    lineNumber: 329,
                                                    columnNumber: 13
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "p-2",
                                                    children: d.store_name
                                                }, void 0, false, {
                                                    fileName: "[project]/components/admin/DealsList.tsx",
                                                    lineNumber: 330,
                                                    columnNumber: 13
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "p-2",
                                                    children: d.category
                                                }, void 0, false, {
                                                    fileName: "[project]/components/admin/DealsList.tsx",
                                                    lineNumber: 331,
                                                    columnNumber: 13
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "p-2",
                                                    children: d.current_price
                                                }, void 0, false, {
                                                    fileName: "[project]/components/admin/DealsList.tsx",
                                                    lineNumber: 332,
                                                    columnNumber: 13
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "p-2",
                                                    children: d.old_price
                                                }, void 0, false, {
                                                    fileName: "[project]/components/admin/DealsList.tsx",
                                                    lineNumber: 333,
                                                    columnNumber: 13
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "p-2",
                                                    children: d.percent_diff
                                                }, void 0, false, {
                                                    fileName: "[project]/components/admin/DealsList.tsx",
                                                    lineNumber: 334,
                                                    columnNumber: 13
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "p-2 text-gray-500",
                                                    children: d.published_at ? new Date(d.published_at).toLocaleDateString() : "—"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/admin/DealsList.tsx",
                                                    lineNumber: 335,
                                                    columnNumber: 13
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "p-2 text-center",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>toggleStatus(d),
                                                        className: `px-3 py-1 rounded text-white text-xs ${d.status === "Published" ? "bg-green-600 hover:bg-green-700" : "bg-gray-500 hover:bg-gray-600"}`,
                                                        children: d.status || "Draft"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/admin/DealsList.tsx",
                                                        lineNumber: 341,
                                                        columnNumber: 15
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/admin/DealsList.tsx",
                                                    lineNumber: 340,
                                                    columnNumber: 13
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "p-2 text-right space-x-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>handleEdit(d),
                                                            className: "px-2 py-1 text-blue-600 border border-blue-500 rounded hover:bg-blue-50",
                                                            children: "Edit"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/admin/DealsList.tsx",
                                                            lineNumber: 353,
                                                            columnNumber: 15
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>handleDelete(d.id),
                                                            className: "px-2 py-1 text-red-600 border border-red-500 rounded hover:bg-red-50",
                                                            children: "Delete"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/admin/DealsList.tsx",
                                                            lineNumber: 359,
                                                            columnNumber: 15
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/admin/DealsList.tsx",
                                                    lineNumber: 352,
                                                    columnNumber: 13
                                                }, this)
                                            ]
                                        }, d.id, true, {
                                            fileName: "[project]/components/admin/DealsList.tsx",
                                            lineNumber: 328,
                                            columnNumber: 11
                                        }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            colSpan: 9,
                                            className: "text-center py-6 text-gray-500",
                                            children: "No deals found"
                                        }, void 0, false, {
                                            fileName: "[project]/components/admin/DealsList.tsx",
                                            lineNumber: 370,
                                            columnNumber: 11
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/DealsList.tsx",
                                        lineNumber: 369,
                                        columnNumber: 9
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/DealsList.tsx",
                                    lineNumber: 325,
                                    columnNumber: 5
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/admin/DealsList.tsx",
                            lineNumber: 310,
                            columnNumber: 3
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/admin/DealsList.tsx",
                        lineNumber: 309,
                        columnNumber: 1
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/admin/DealsList.tsx",
                lineNumber: 222,
                columnNumber: 3
            }, this),
            " ",
            totalPages > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        disabled: page === 1,
                        onClick: ()=>setPage((p)=>p - 1),
                        className: `px-3 py-1 rounded-md border ${page === 1 ? "bg-gray-200 text-gray-400" : "bg-white text-blue-600 border-blue-400 hover:bg-blue-50"}`,
                        children: "Previous"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/DealsList.tsx",
                        lineNumber: 384,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-gray-600",
                        children: [
                            "Page ",
                            page,
                            " of ",
                            totalPages
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/admin/DealsList.tsx",
                        lineNumber: 396,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        disabled: page === totalPages,
                        onClick: ()=>setPage((p)=>p + 1),
                        className: `px-3 py-1 rounded-md border ${page === totalPages ? "bg-gray-200 text-gray-400" : "bg-white text-blue-600 border-blue-400 hover:bg-blue-50"}`,
                        children: "Next"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/DealsList.tsx",
                        lineNumber: 400,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/admin/DealsList.tsx",
                lineNumber: 383,
                columnNumber: 9
            }, this),
            isModalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-semibold mb-4",
                            children: "Edit Deal"
                        }, void 0, false, {
                            fileName: "[project]/components/admin/DealsList.tsx",
                            lineNumber: 418,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded",
                                    placeholder: "Description",
                                    value: editDeal?.description || "",
                                    onChange: (e)=>setEditDeal({
                                            ...editDeal,
                                            description: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/DealsList.tsx",
                                    lineNumber: 421,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded",
                                    placeholder: "Store Name",
                                    value: editDeal?.store_name || "",
                                    onChange: (e)=>setEditDeal({
                                            ...editDeal,
                                            store_name: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/DealsList.tsx",
                                    lineNumber: 429,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "number",
                                    className: "border p-2 rounded",
                                    placeholder: "Old Price",
                                    value: editDeal?.old_price || "",
                                    onChange: (e)=>{
                                        const newOld = parseFloat(e.target.value || "0");
                                        const newCurr = parseFloat(editDeal?.current_price || "0");
                                        const priceDiff = newOld - newCurr;
                                        const percentDiff = newOld ? Number((priceDiff / newOld * 100).toFixed(2)) : 0;
                                        let dealLevel = "";
                                        if (percentDiff >= 40 && percentDiff < 51) dealLevel = "Blistering deal";
                                        else if (percentDiff >= 51 && percentDiff < 61) dealLevel = "Scorching deal";
                                        else if (percentDiff >= 61 && percentDiff < 71) dealLevel = "Searing deal";
                                        else if (percentDiff >= 71) dealLevel = "Flaming deal";
                                        setEditDeal({
                                            ...editDeal,
                                            old_price: newOld,
                                            price_diff: priceDiff,
                                            percent_diff: percentDiff,
                                            deal_level: dealLevel
                                        });
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/DealsList.tsx",
                                    lineNumber: 437,
                                    columnNumber: 14
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "number",
                                    className: "border p-2 rounded",
                                    placeholder: "Current Price",
                                    value: editDeal?.current_price || "",
                                    onChange: (e)=>{
                                        const newCurr = parseFloat(e.target.value || "0");
                                        const newOld = parseFloat(editDeal?.old_price || "0");
                                        const priceDiff = newOld - newCurr;
                                        const percentDiff = newOld ? Number((priceDiff / newOld * 100).toFixed(2)) : 0;
                                        let dealLevel = "";
                                        if (percentDiff >= 40 && percentDiff < 49) dealLevel = "Blistering deal";
                                        else if (percentDiff >= 50 && percentDiff < 59) dealLevel = "Scorching deal";
                                        else if (percentDiff >= 60 && percentDiff < 69) dealLevel = "Searing deal";
                                        else if (percentDiff >= 70) dealLevel = "Flaming deal";
                                        setEditDeal({
                                            ...editDeal,
                                            current_price: newCurr,
                                            price_diff: priceDiff,
                                            percent_diff: percentDiff,
                                            deal_level: dealLevel
                                        });
                                    }
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/DealsList.tsx",
                                    lineNumber: 466,
                                    columnNumber: 1
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded",
                                    placeholder: "Product Link",
                                    value: editDeal?.product_link || "",
                                    onChange: (e)=>setEditDeal({
                                            ...editDeal,
                                            product_link: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/DealsList.tsx",
                                    lineNumber: 495,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded",
                                    placeholder: "Image Link",
                                    value: editDeal?.image_link || "",
                                    onChange: (e)=>setEditDeal({
                                            ...editDeal,
                                            image_link: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/DealsList.tsx",
                                    lineNumber: 503,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded",
                                    placeholder: "Review Link",
                                    value: editDeal?.review_link || "",
                                    onChange: (e)=>setEditDeal({
                                            ...editDeal,
                                            review_link: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/DealsList.tsx",
                                    lineNumber: 511,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded",
                                    placeholder: "Coupon Code",
                                    value: editDeal?.coupon_code || "",
                                    onChange: (e)=>setEditDeal({
                                            ...editDeal,
                                            coupon_code: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/DealsList.tsx",
                                    lineNumber: 519,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded",
                                    placeholder: "Shipping Cost",
                                    value: editDeal?.shipping_cost || "",
                                    onChange: (e)=>setEditDeal({
                                            ...editDeal,
                                            shipping_cost: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/DealsList.tsx",
                                    lineNumber: 527,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded",
                                    placeholder: "Category",
                                    value: editDeal?.category || "",
                                    onChange: (e)=>setEditDeal({
                                            ...editDeal,
                                            category: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/DealsList.tsx",
                                    lineNumber: 535,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded",
                                    placeholder: "Notes",
                                    value: editDeal?.notes || "",
                                    onChange: (e)=>setEditDeal({
                                            ...editDeal,
                                            notes: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/DealsList.tsx",
                                    lineNumber: 544,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                    className: "border p-2 rounded",
                                    value: editDeal?.holiday_tag || "",
                                    onChange: (e)=>setEditDeal({
                                            ...editDeal,
                                            holiday_tag: e.target.value
                                        }),
                                    children: __TURBOPACK__imported__module__$5b$project$5d2f$constants$2f$holidays$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HOLIDAY_TAGS"].map((tag)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                            value: tag,
                                            children: tag === "" ? "No holiday / event" : tag
                                        }, tag, false, {
                                            fileName: "[project]/components/admin/DealsList.tsx",
                                            lineNumber: 560,
                                            columnNumber: 5
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/DealsList.tsx",
                                    lineNumber: 552,
                                    columnNumber: 6
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/admin/DealsList.tsx",
                            lineNumber: 420,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end gap-2 mt-5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsModalOpen(false),
                                    className: "px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400",
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/DealsList.tsx",
                                    lineNumber: 570,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleSave,
                                    disabled: saving,
                                    className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50",
                                    children: saving ? "Saving..." : "Save Changes"
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/DealsList.tsx",
                                    lineNumber: 576,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/admin/DealsList.tsx",
                            lineNumber: 569,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/admin/DealsList.tsx",
                    lineNumber: 417,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/admin/DealsList.tsx",
                lineNumber: 416,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/admin/DealsList.tsx",
        lineNumber: 218,
        columnNumber: 2
    }, this);
}
_s(DealsList, "oXmqXQ54v5UM8FOEO+U1m/d67AY=");
_c = DealsList;
var _c;
__turbopack_context__.k.register(_c, "DealsList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/admin/CatalogList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CatalogList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function CatalogList() {
    _s();
    const [catalogs, setCatalogs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // 🔍 Filters
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [storeFilter, setStoreFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [dateFilter, setDateFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // ↕️ Sorting
    const [sortField, setSortField] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("published_at");
    const [sortOrder, setSortOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("desc");
    // 📄 Pagination
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const rowsPerPage = 20;
    // ✏️ Edit Modal
    const [isModalOpen, setIsModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editCatalog, setEditCatalog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const fetchCatalogs = async ()=>{
        setLoading(true);
        try {
            const res = await fetch("/api/catalogs");
            const data = await res.json();
            if (res.ok) setCatalogs(data);
            else setError(data.error || "Failed to load catalogs");
        } catch (e) {
            setError(e.message);
        } finally{
            setLoading(false);
        }
    };
    const handleDelete = async (id)=>{
        if (!confirm("Are you sure you want to delete this catalog?")) return;
        try {
            const res = await fetch("/api/catalogs", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id
                })
            });
            const data = await res.json();
            if (res.ok) {
                setCatalogs(catalogs.filter((c)=>c.id !== id));
            } else {
                alert(`❌ ${data.error || "Failed to delete"}`);
            }
        } catch (e) {
            alert(`❌ ${e.message}`);
        }
    };
    const handleEdit = (catalog)=>{
        setEditCatalog(catalog);
        setIsModalOpen(true);
    };
    const handleSave = async ()=>{
        if (!editCatalog) return;
        setSaving(true);
        try {
            const res = await fetch("/api/catalogs", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: editCatalog.id,
                    store_name: editCatalog.store_name ?? "",
                    start_date: editCatalog.start_date ?? "",
                    end_date: editCatalog.end_date ?? "",
                    catalog_link: editCatalog.catalog_link ?? "",
                    screenshot_link: editCatalog.screenshot_link ?? "",
                    published_at: editCatalog.published_at ?? new Date().toISOString()
                })
            });
            const data = await res.json();
            if (res.ok) {
                setCatalogs((prev)=>prev.map((c)=>c.id === editCatalog.id ? data.updated : c));
                setIsModalOpen(false);
            } else {
                alert(`❌ ${data.error || "Failed to update"}`);
            }
        } catch (e) {
            alert(`❌ ${e.message}`);
        } finally{
            setSaving(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CatalogList.useEffect": ()=>{
            fetchCatalogs();
        }
    }["CatalogList.useEffect"], []);
    // 🧮 Filtered and Sorted
    const filteredCatalogs = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CatalogList.useMemo[filteredCatalogs]": ()=>{
            let result = catalogs.filter({
                "CatalogList.useMemo[filteredCatalogs].result": (cat)=>{
                    const matchesSearch = search === "" || cat.store_name?.toLowerCase().includes(search.toLowerCase());
                    const matchesStore = storeFilter === "" || cat.store_name?.toLowerCase() === storeFilter.toLowerCase();
                    const matchesDate = dateFilter === "" || cat.published_at && new Date(cat.published_at).toISOString().split("T")[0] >= dateFilter;
                    return matchesSearch && matchesStore && matchesDate;
                }
            }["CatalogList.useMemo[filteredCatalogs].result"]);
            result.sort({
                "CatalogList.useMemo[filteredCatalogs]": (a, b)=>{
                    const valA = a[sortField];
                    const valB = b[sortField];
                    if (valA == null || valB == null) return 0;
                    if (sortField === "published_at") {
                        const dateA = new Date(valA).getTime();
                        const dateB = new Date(valB).getTime();
                        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
                    }
                    if (typeof valA === "string") {
                        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
                    }
                    return sortOrder === "asc" ? valA - valB : valB - valA;
                }
            }["CatalogList.useMemo[filteredCatalogs]"]);
            return result;
        }
    }["CatalogList.useMemo[filteredCatalogs]"], [
        catalogs,
        search,
        storeFilter,
        dateFilter,
        sortField,
        sortOrder
    ]);
    // 📄 Pagination logic
    const totalPages = Math.ceil(filteredCatalogs.length / rowsPerPage);
    const paginatedCatalogs = filteredCatalogs.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    const storeNames = Array.from(new Set(catalogs.map((c)=>c.store_name))).filter(Boolean);
    const resetFilters = ()=>{
        setSearch("");
        setStoreFilter("");
        setDateFilter("");
        setSortField("published_at");
        setSortOrder("desc");
        setPage(1);
    };
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "text-gray-600",
        children: "Loading catalogs..."
    }, void 0, false, {
        fileName: "[project]/components/admin/CatalogList.tsx",
        lineNumber: 162,
        columnNumber: 23
    }, this);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "text-red-500",
        children: error
    }, void 0, false, {
        fileName: "[project]/components/admin/CatalogList.tsx",
        lineNumber: 163,
        columnNumber: 21
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-6 relative",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-xl font-semibold text-blue-600 mb-3",
                children: "All Published Catalogs"
            }, void 0, false, {
                fileName: "[project]/components/admin/CatalogList.tsx",
                lineNumber: 167,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-3 mb-4 items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "Search store name...",
                        className: "border rounded-md p-2 flex-1 min-w-[200px]",
                        value: search,
                        onChange: (e)=>setSearch(e.target.value)
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CatalogList.tsx",
                        lineNumber: 173,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        className: "border rounded-md p-2",
                        value: storeFilter,
                        onChange: (e)=>setStoreFilter(e.target.value),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "All Stores"
                            }, void 0, false, {
                                fileName: "[project]/components/admin/CatalogList.tsx",
                                lineNumber: 186,
                                columnNumber: 11
                            }, this),
                            storeNames.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: s,
                                    children: s
                                }, s, false, {
                                    fileName: "[project]/components/admin/CatalogList.tsx",
                                    lineNumber: 188,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/admin/CatalogList.tsx",
                        lineNumber: 181,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "date",
                        className: "border rounded-md p-2",
                        value: dateFilter,
                        onChange: (e)=>setDateFilter(e.target.value)
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CatalogList.tsx",
                        lineNumber: 194,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        className: "border rounded-md p-2",
                        value: sortField,
                        onChange: (e)=>setSortField(e.target.value),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "published_at",
                                children: "Sort by Published Date"
                            }, void 0, false, {
                                fileName: "[project]/components/admin/CatalogList.tsx",
                                lineNumber: 207,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "store_name",
                                children: "Sort by Store"
                            }, void 0, false, {
                                fileName: "[project]/components/admin/CatalogList.tsx",
                                lineNumber: 208,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "start_date",
                                children: "Sort by Start Date"
                            }, void 0, false, {
                                fileName: "[project]/components/admin/CatalogList.tsx",
                                lineNumber: 209,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "end_date",
                                children: "Sort by End Date"
                            }, void 0, false, {
                                fileName: "[project]/components/admin/CatalogList.tsx",
                                lineNumber: 210,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/admin/CatalogList.tsx",
                        lineNumber: 202,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        className: "border rounded-md p-2",
                        value: sortOrder,
                        onChange: (e)=>setSortOrder(e.target.value),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "desc",
                                children: "Descending"
                            }, void 0, false, {
                                fileName: "[project]/components/admin/CatalogList.tsx",
                                lineNumber: 218,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "asc",
                                children: "Ascending"
                            }, void 0, false, {
                                fileName: "[project]/components/admin/CatalogList.tsx",
                                lineNumber: 219,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/admin/CatalogList.tsx",
                        lineNumber: 213,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: fetchCatalogs,
                        className: "px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700",
                        children: "Refresh"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CatalogList.tsx",
                        lineNumber: 222,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: resetFilters,
                        className: "px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400",
                        children: "Reset"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CatalogList.tsx",
                        lineNumber: 229,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/admin/CatalogList.tsx",
                lineNumber: 172,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto border border-gray-200 rounded-md",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "min-w-full text-sm text-gray-700",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "bg-gray-100 text-left",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-2",
                                        children: "Store"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CatalogList.tsx",
                                        lineNumber: 242,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-2",
                                        children: "Start Date"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CatalogList.tsx",
                                        lineNumber: 243,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-2",
                                        children: "End Date"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CatalogList.tsx",
                                        lineNumber: 244,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-2",
                                        children: "Catalog Link"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CatalogList.tsx",
                                        lineNumber: 245,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-2",
                                        children: "Screenshot"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CatalogList.tsx",
                                        lineNumber: 246,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-2",
                                        children: "Published"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CatalogList.tsx",
                                        lineNumber: 247,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-2 text-right",
                                        children: "Actions"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CatalogList.tsx",
                                        lineNumber: 248,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/admin/CatalogList.tsx",
                                lineNumber: 241,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/admin/CatalogList.tsx",
                            lineNumber: 240,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: paginatedCatalogs.map((cat)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "border-t hover:bg-gray-50 transition",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2",
                                            children: cat.store_name
                                        }, void 0, false, {
                                            fileName: "[project]/components/admin/CatalogList.tsx",
                                            lineNumber: 254,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2",
                                            children: cat.start_date ? new Date(cat.start_date).toLocaleDateString() : "—"
                                        }, void 0, false, {
                                            fileName: "[project]/components/admin/CatalogList.tsx",
                                            lineNumber: 255,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2",
                                            children: cat.end_date ? new Date(cat.end_date).toLocaleDateString() : "—"
                                        }, void 0, false, {
                                            fileName: "[project]/components/admin/CatalogList.tsx",
                                            lineNumber: 260,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2 text-blue-600 underline",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: cat.catalog_link,
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                                children: "View"
                                            }, void 0, false, {
                                                fileName: "[project]/components/admin/CatalogList.tsx",
                                                lineNumber: 266,
                                                columnNumber: 19
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/admin/CatalogList.tsx",
                                            lineNumber: 265,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2 text-blue-600 underline",
                                            children: cat.screenshot_link ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: cat.screenshot_link,
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                                children: "View"
                                            }, void 0, false, {
                                                fileName: "[project]/components/admin/CatalogList.tsx",
                                                lineNumber: 276,
                                                columnNumber: 21
                                            }, this) : "—"
                                        }, void 0, false, {
                                            fileName: "[project]/components/admin/CatalogList.tsx",
                                            lineNumber: 274,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2 text-gray-500",
                                            children: cat.published_at ? new Date(cat.published_at).toLocaleDateString() : "—"
                                        }, void 0, false, {
                                            fileName: "[project]/components/admin/CatalogList.tsx",
                                            lineNumber: 287,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2 text-right space-x-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleEdit(cat),
                                                    className: "px-2 py-1 text-blue-600 border border-blue-500 rounded hover:bg-blue-50",
                                                    children: "Edit"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/admin/CatalogList.tsx",
                                                    lineNumber: 293,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleDelete(cat.id),
                                                    className: "px-2 py-1 text-red-600 border border-red-500 rounded hover:bg-red-50",
                                                    children: "Delete"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/admin/CatalogList.tsx",
                                                    lineNumber: 299,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/admin/CatalogList.tsx",
                                            lineNumber: 292,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, cat.id, true, {
                                    fileName: "[project]/components/admin/CatalogList.tsx",
                                    lineNumber: 253,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/admin/CatalogList.tsx",
                            lineNumber: 251,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/admin/CatalogList.tsx",
                    lineNumber: 239,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/admin/CatalogList.tsx",
                lineNumber: 238,
                columnNumber: 7
            }, this),
            totalPages > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        disabled: page === 1,
                        onClick: ()=>setPage((p)=>p - 1),
                        className: `px-3 py-1 rounded-md border ${page === 1 ? "bg-gray-200 text-gray-400" : "bg-white text-blue-600 border-blue-400 hover:bg-blue-50"}`,
                        children: "Previous"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CatalogList.tsx",
                        lineNumber: 315,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-gray-600",
                        children: [
                            "Page ",
                            page,
                            " of ",
                            totalPages
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/admin/CatalogList.tsx",
                        lineNumber: 327,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        disabled: page === totalPages,
                        onClick: ()=>setPage((p)=>p + 1),
                        className: `px-3 py-1 rounded-md border ${page === totalPages ? "bg-gray-200 text-gray-400" : "bg-white text-blue-600 border-blue-400 hover:bg-blue-50"}`,
                        children: "Next"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CatalogList.tsx",
                        lineNumber: 331,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/admin/CatalogList.tsx",
                lineNumber: 314,
                columnNumber: 9
            }, this),
            isModalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-semibold mb-4",
                            children: "Edit Catalog"
                        }, void 0, false, {
                            fileName: "[project]/components/admin/CatalogList.tsx",
                            lineNumber: 349,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded",
                                    placeholder: "Store Name",
                                    value: editCatalog?.store_name || "",
                                    onChange: (e)=>setEditCatalog({
                                            ...editCatalog,
                                            store_name: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CatalogList.tsx",
                                    lineNumber: 352,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "date",
                                    className: "border p-2 rounded",
                                    value: editCatalog?.start_date ? new Date(editCatalog.start_date).toISOString().split("T")[0] : "",
                                    onChange: (e)=>setEditCatalog({
                                            ...editCatalog,
                                            start_date: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CatalogList.tsx",
                                    lineNumber: 360,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "date",
                                    className: "border p-2 rounded",
                                    value: editCatalog?.end_date ? new Date(editCatalog.end_date).toISOString().split("T")[0] : "",
                                    onChange: (e)=>setEditCatalog({
                                            ...editCatalog,
                                            end_date: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CatalogList.tsx",
                                    lineNumber: 374,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded col-span-2",
                                    placeholder: "Catalog Link (URL)",
                                    value: editCatalog?.catalog_link || "",
                                    onChange: (e)=>setEditCatalog({
                                            ...editCatalog,
                                            catalog_link: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CatalogList.tsx",
                                    lineNumber: 386,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded col-span-2",
                                    placeholder: "Screenshot Link",
                                    value: editCatalog?.screenshot_link || "",
                                    onChange: (e)=>setEditCatalog({
                                            ...editCatalog,
                                            screenshot_link: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CatalogList.tsx",
                                    lineNumber: 397,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/admin/CatalogList.tsx",
                            lineNumber: 351,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end gap-2 mt-5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsModalOpen(false),
                                    className: "px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400",
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CatalogList.tsx",
                                    lineNumber: 411,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleSave,
                                    disabled: saving,
                                    className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50",
                                    children: saving ? "Saving..." : "Save Changes"
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CatalogList.tsx",
                                    lineNumber: 417,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/admin/CatalogList.tsx",
                            lineNumber: 410,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/admin/CatalogList.tsx",
                    lineNumber: 348,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/admin/CatalogList.tsx",
                lineNumber: 347,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/admin/CatalogList.tsx",
        lineNumber: 166,
        columnNumber: 5
    }, this);
}
_s(CatalogList, "VbkhqsOM7+rEK7LlzUb8pwM1vBQ=");
_c = CatalogList;
var _c;
__turbopack_context__.k.register(_c, "CatalogList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/admin/CouponList.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CouponList
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function CouponList() {
    _s();
    const [coupons, setCoupons] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Filters
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [storeFilter, setStoreFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [categoryFilter, setCategoryFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [dateFilter, setDateFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // Sorting
    const [sortField, setSortField] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("published_at");
    const [sortOrder, setSortOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("desc");
    // Pagination
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const rowsPerPage = 20;
    // Edit modal
    const [isModalOpen, setIsModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [editCoupon, setEditCoupon] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const fetchCoupons = async ()=>{
        setLoading(true);
        try {
            const res = await fetch("/api/coupons");
            const data = await res.json();
            if (res.ok) setCoupons(data);
            else setError(data.error || "Failed to load coupons");
        } catch (e) {
            setError(e.message);
        } finally{
            setLoading(false);
        }
    };
    const handleDelete = async (id)=>{
        if (!confirm("Are you sure you want to delete this coupon?")) return;
        try {
            const res = await fetch("/api/coupons", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id
                })
            });
            const data = await res.json();
            if (res.ok) setCoupons(coupons.filter((c)=>c.id !== id));
            else alert(`❌ ${data.error || "Failed to delete"}`);
        } catch (e) {
            alert(`❌ ${e.message}`);
        }
    };
    const handleEdit = (coupon)=>{
        setEditCoupon(coupon);
        setIsModalOpen(true);
    };
    const handleSave = async ()=>{
        if (!editCoupon) return;
        setSaving(true);
        try {
            const res = await fetch("/api/coupons", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: editCoupon.id,
                    store_name: editCoupon.store_name ?? "",
                    category: editCoupon.category ?? "",
                    coupon_code: editCoupon.coupon_code ?? "",
                    discount_type: editCoupon.discount_type ?? "",
                    discount_value: editCoupon.discount_value ?? "",
                    coupon_link: editCoupon.coupon_link ?? "",
                    expire_date: editCoupon.expire_date ?? "",
                    notes: editCoupon.notes ?? "",
                    published_at: editCoupon.published_at ?? new Date().toISOString()
                })
            });
            const data = await res.json();
            if (res.ok) {
                setCoupons((prev)=>prev.map((c)=>c.id === editCoupon.id ? data.updated : c));
                setIsModalOpen(false);
            } else {
                alert(`❌ ${data.error || "Failed to update"}`);
            }
        } catch (e) {
            alert(`❌ ${e.message}`);
        } finally{
            setSaving(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CouponList.useEffect": ()=>{
            fetchCoupons();
        }
    }["CouponList.useEffect"], []);
    // Filtered + Sorted
    const filteredCoupons = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "CouponList.useMemo[filteredCoupons]": ()=>{
            let result = coupons.filter({
                "CouponList.useMemo[filteredCoupons].result": (c)=>{
                    const matchesSearch = search === "" || c.coupon_code?.toLowerCase().includes(search.toLowerCase());
                    const matchesStore = storeFilter === "" || c.store_name?.toLowerCase() === storeFilter.toLowerCase();
                    const matchesCategory = categoryFilter === "" || c.category?.toLowerCase() === categoryFilter.toLowerCase();
                    const matchesDate = dateFilter === "" || c.published_at && new Date(c.published_at).toISOString().split("T")[0] >= dateFilter;
                    return matchesSearch && matchesStore && matchesCategory && matchesDate;
                }
            }["CouponList.useMemo[filteredCoupons].result"]);
            result.sort({
                "CouponList.useMemo[filteredCoupons]": (a, b)=>{
                    const valA = a[sortField];
                    const valB = b[sortField];
                    if (valA == null || valB == null) return 0;
                    if (sortField === "published_at") {
                        const dateA = new Date(valA).getTime();
                        const dateB = new Date(valB).getTime();
                        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
                    }
                    if (typeof valA === "string") {
                        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
                    }
                    return sortOrder === "asc" ? valA - valB : valB - valA;
                }
            }["CouponList.useMemo[filteredCoupons]"]);
            return result;
        }
    }["CouponList.useMemo[filteredCoupons]"], [
        coupons,
        search,
        storeFilter,
        categoryFilter,
        dateFilter,
        sortField,
        sortOrder
    ]);
    const totalPages = Math.ceil(filteredCoupons.length / rowsPerPage);
    const paginatedCoupons = filteredCoupons.slice((page - 1) * rowsPerPage, page * rowsPerPage);
    const storeNames = Array.from(new Set(coupons.map((c)=>c.store_name))).filter(Boolean);
    const categories = Array.from(new Set(coupons.map((c)=>c.category))).filter(Boolean);
    const resetFilters = ()=>{
        setSearch("");
        setStoreFilter("");
        setCategoryFilter("");
        setDateFilter("");
        setSortField("published_at");
        setSortOrder("desc");
        setPage(1);
    };
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        children: "Loading coupons..."
    }, void 0, false, {
        fileName: "[project]/components/admin/CouponList.tsx",
        lineNumber: 164,
        columnNumber: 23
    }, this);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
        className: "text-red-500",
        children: error
    }, void 0, false, {
        fileName: "[project]/components/admin/CouponList.tsx",
        lineNumber: 165,
        columnNumber: 21
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "mt-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-xl font-semibold text-blue-600 mb-3",
                children: "All Published Coupons"
            }, void 0, false, {
                fileName: "[project]/components/admin/CouponList.tsx",
                lineNumber: 169,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap gap-3 mb-4 items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        placeholder: "Search by code...",
                        className: "border rounded-md p-2 flex-1 min-w-[200px]",
                        value: search,
                        onChange: (e)=>setSearch(e.target.value)
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CouponList.tsx",
                        lineNumber: 175,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        className: "border rounded-md p-2",
                        value: storeFilter,
                        onChange: (e)=>setStoreFilter(e.target.value),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "All Stores"
                            }, void 0, false, {
                                fileName: "[project]/components/admin/CouponList.tsx",
                                lineNumber: 187,
                                columnNumber: 11
                            }, this),
                            storeNames.map((s)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: s,
                                    children: s
                                }, s, false, {
                                    fileName: "[project]/components/admin/CouponList.tsx",
                                    lineNumber: 189,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/admin/CouponList.tsx",
                        lineNumber: 182,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                        className: "border rounded-md p-2",
                        value: categoryFilter,
                        onChange: (e)=>setCategoryFilter(e.target.value),
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                value: "",
                                children: "All Categories"
                            }, void 0, false, {
                                fileName: "[project]/components/admin/CouponList.tsx",
                                lineNumber: 199,
                                columnNumber: 11
                            }, this),
                            categories.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                    value: c,
                                    children: c
                                }, c, false, {
                                    fileName: "[project]/components/admin/CouponList.tsx",
                                    lineNumber: 201,
                                    columnNumber: 13
                                }, this))
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/admin/CouponList.tsx",
                        lineNumber: 194,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "date",
                        className: "border rounded-md p-2",
                        value: dateFilter,
                        onChange: (e)=>setDateFilter(e.target.value)
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CouponList.tsx",
                        lineNumber: 206,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: fetchCoupons,
                        className: "px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700",
                        children: "Refresh"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CouponList.tsx",
                        lineNumber: 212,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: resetFilters,
                        className: "px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400",
                        children: "Reset"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CouponList.tsx",
                        lineNumber: 218,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/admin/CouponList.tsx",
                lineNumber: 174,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "overflow-x-auto border border-gray-200 rounded-md",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                    className: "min-w-full text-sm text-gray-700",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                            className: "bg-gray-100 text-left",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-2",
                                        children: "Store"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CouponList.tsx",
                                        lineNumber: 231,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-2",
                                        children: "Category"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CouponList.tsx",
                                        lineNumber: 232,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-2",
                                        children: "Coupon Code"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CouponList.tsx",
                                        lineNumber: 233,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-2",
                                        children: "Discount"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CouponList.tsx",
                                        lineNumber: 234,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-2",
                                        children: "Link"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CouponList.tsx",
                                        lineNumber: 235,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-2",
                                        children: "Expire Date"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CouponList.tsx",
                                        lineNumber: 236,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                        className: "p-2 text-right",
                                        children: "Actions"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/CouponList.tsx",
                                        lineNumber: 237,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/admin/CouponList.tsx",
                                lineNumber: 230,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/admin/CouponList.tsx",
                            lineNumber: 229,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                            children: paginatedCoupons.map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                    className: "border-t hover:bg-gray-50 transition",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2",
                                            children: c.store_name
                                        }, void 0, false, {
                                            fileName: "[project]/components/admin/CouponList.tsx",
                                            lineNumber: 243,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2",
                                            children: c.category
                                        }, void 0, false, {
                                            fileName: "[project]/components/admin/CouponList.tsx",
                                            lineNumber: 244,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2",
                                            children: c.coupon_code
                                        }, void 0, false, {
                                            fileName: "[project]/components/admin/CouponList.tsx",
                                            lineNumber: 245,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2",
                                            children: c.discount_type && c.discount_value ? `${c.discount_value}${c.discount_type}` : "—"
                                        }, void 0, false, {
                                            fileName: "[project]/components/admin/CouponList.tsx",
                                            lineNumber: 246,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2 text-blue-600 underline",
                                            children: c.coupon_link ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                href: c.coupon_link,
                                                target: "_blank",
                                                rel: "noopener noreferrer",
                                                children: "View"
                                            }, void 0, false, {
                                                fileName: "[project]/components/admin/CouponList.tsx",
                                                lineNumber: 253,
                                                columnNumber: 21
                                            }, this) : "—"
                                        }, void 0, false, {
                                            fileName: "[project]/components/admin/CouponList.tsx",
                                            lineNumber: 251,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2",
                                            children: c.expire_date ? new Date(c.expire_date).toLocaleDateString() : "—"
                                        }, void 0, false, {
                                            fileName: "[project]/components/admin/CouponList.tsx",
                                            lineNumber: 260,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                            className: "p-2 text-right space-x-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleEdit(c),
                                                    className: "px-2 py-1 text-blue-600 border border-blue-500 rounded hover:bg-blue-50",
                                                    children: "Edit"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/admin/CouponList.tsx",
                                                    lineNumber: 266,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>handleDelete(c.id),
                                                    className: "px-2 py-1 text-red-600 border border-red-500 rounded hover:bg-red-50",
                                                    children: "Delete"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/admin/CouponList.tsx",
                                                    lineNumber: 272,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/admin/CouponList.tsx",
                                            lineNumber: 265,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, c.id, true, {
                                    fileName: "[project]/components/admin/CouponList.tsx",
                                    lineNumber: 242,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/components/admin/CouponList.tsx",
                            lineNumber: 240,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/admin/CouponList.tsx",
                    lineNumber: 228,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/admin/CouponList.tsx",
                lineNumber: 227,
                columnNumber: 7
            }, this),
            totalPages > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between items-center mt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        disabled: page === 1,
                        onClick: ()=>setPage((p)=>p - 1),
                        className: "px-3 py-1 rounded-md border",
                        children: "Previous"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CouponList.tsx",
                        lineNumber: 288,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        children: [
                            "Page ",
                            page,
                            " of ",
                            totalPages
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/admin/CouponList.tsx",
                        lineNumber: 295,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        disabled: page === totalPages,
                        onClick: ()=>setPage((p)=>p + 1),
                        className: "px-3 py-1 rounded-md border",
                        children: "Next"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/CouponList.tsx",
                        lineNumber: 298,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/admin/CouponList.tsx",
                lineNumber: 287,
                columnNumber: 9
            }, this),
            isModalOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white rounded-lg shadow-lg w-full max-w-2xl p-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-lg font-semibold mb-4",
                            children: "Edit Coupon"
                        }, void 0, false, {
                            fileName: "[project]/components/admin/CouponList.tsx",
                            lineNumber: 312,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded",
                                    placeholder: "Store Name",
                                    value: editCoupon?.store_name || "",
                                    onChange: (e)=>setEditCoupon({
                                            ...editCoupon,
                                            store_name: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CouponList.tsx",
                                    lineNumber: 315,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded",
                                    placeholder: "Category",
                                    value: editCoupon?.category || "",
                                    onChange: (e)=>setEditCoupon({
                                            ...editCoupon,
                                            category: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CouponList.tsx",
                                    lineNumber: 323,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded",
                                    placeholder: "Coupon Code",
                                    value: editCoupon?.coupon_code || "",
                                    onChange: (e)=>setEditCoupon({
                                            ...editCoupon,
                                            coupon_code: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CouponList.tsx",
                                    lineNumber: 331,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded",
                                    placeholder: "Discount Type (e.g. %, $)",
                                    value: editCoupon?.discount_type || "",
                                    onChange: (e)=>setEditCoupon({
                                            ...editCoupon,
                                            discount_type: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CouponList.tsx",
                                    lineNumber: 339,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "number",
                                    className: "border p-2 rounded",
                                    placeholder: "Discount Value",
                                    value: editCoupon?.discount_value || "",
                                    onChange: (e)=>setEditCoupon({
                                            ...editCoupon,
                                            discount_value: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CouponList.tsx",
                                    lineNumber: 347,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    className: "border p-2 rounded col-span-2",
                                    placeholder: "Coupon Link (URL)",
                                    value: editCoupon?.coupon_link || "",
                                    onChange: (e)=>setEditCoupon({
                                            ...editCoupon,
                                            coupon_link: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CouponList.tsx",
                                    lineNumber: 359,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "date",
                                    className: "border p-2 rounded col-span-2",
                                    value: editCoupon?.expire_date ? new Date(editCoupon.expire_date).toISOString().split("T")[0] : "",
                                    onChange: (e)=>setEditCoupon({
                                            ...editCoupon,
                                            expire_date: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CouponList.tsx",
                                    lineNumber: 370,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                    className: "border p-2 rounded col-span-2",
                                    placeholder: "Notes",
                                    value: editCoupon?.notes || "",
                                    onChange: (e)=>setEditCoupon({
                                            ...editCoupon,
                                            notes: e.target.value
                                        })
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CouponList.tsx",
                                    lineNumber: 382,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/admin/CouponList.tsx",
                            lineNumber: 314,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end gap-2 mt-5",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setIsModalOpen(false),
                                    className: "px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400",
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CouponList.tsx",
                                    lineNumber: 393,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleSave,
                                    disabled: saving,
                                    className: "px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50",
                                    children: saving ? "Saving..." : "Save Changes"
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/CouponList.tsx",
                                    lineNumber: 399,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/admin/CouponList.tsx",
                            lineNumber: 392,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/admin/CouponList.tsx",
                    lineNumber: 311,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/components/admin/CouponList.tsx",
                lineNumber: 310,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/admin/CouponList.tsx",
        lineNumber: 168,
        columnNumber: 5
    }, this);
}
_s(CouponList, "KBgw3Q8YyO+2hOQNclPp3nXBsE4=");
_c = CouponList;
var _c;
__turbopack_context__.k.register(_c, "CouponList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/admin/BulkUploadDeals.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BulkUploadDeals
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$papaparse$2f$papaparse$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/papaparse/papaparse.min.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/xlsx/xlsx.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
function BulkUploadDeals() {
    _s();
    const [file, setFile] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [uploading, setUploading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const handleFileChange = (e)=>{
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setResult(""); // clear previous result
        }
    };
    const parseCSV = (file)=>new Promise((resolve, reject)=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$papaparse$2f$papaparse$2e$min$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results)=>resolve(results.data),
                error: reject
            });
        });
    const parseXLSX = (file)=>new Promise((resolve, reject)=>{
            const reader = new FileReader();
            reader.onload = (e)=>{
                try {
                    const data = new Uint8Array(e.target?.result);
                    const workbook = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["read"](data, {
                        type: "array"
                    });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const json = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$xlsx$2f$xlsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["utils"].sheet_to_json(worksheet, {
                        defval: ""
                    });
                    resolve(json);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    const handleUpload = async ()=>{
        if (!file) return alert("Please select a file first.");
        setUploading(true);
        setResult("");
        try {
            let deals = [];
            if (file.name.endsWith(".csv")) {
                deals = await parseCSV(file);
            } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
                deals = await parseXLSX(file);
            } else {
                alert("Unsupported file format. Please upload a CSV or Excel file.");
                setUploading(false);
                return;
            }
            if (!deals.length) {
                alert("No valid data found in file.");
                setUploading(false);
                return;
            }
            const res = await fetch("/api/deals/bulk", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    deals
                })
            });
            const data = await res.json();
            if (res.ok) {
                setResult(`✅ Successfully uploaded ${data.inserted || deals.length} deals.`);
            } else {
                setResult(`❌ Error: ${data.error || "Upload failed."}`);
            }
        } catch (err) {
            console.error("Upload error:", err);
            setResult(`❌ ${err.message || "Error parsing or uploading file."}`);
        } finally{
            setUploading(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "p-6 bg-white rounded-lg shadow border border-gray-200",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-lg font-semibold mb-3 text-blue-600",
                children: "Bulk Upload Deals"
            }, void 0, false, {
                fileName: "[project]/components/admin/BulkUploadDeals.tsx",
                lineNumber: 93,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "file",
                accept: ".csv, .xlsx, .xls",
                onChange: handleFileChange,
                className: "border border-gray-300 p-2 rounded-md w-full mb-3"
            }, void 0, false, {
                fileName: "[project]/components/admin/BulkUploadDeals.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleUpload,
                disabled: !file || uploading,
                className: `px-4 py-2 text-white rounded-md ${uploading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`,
                children: uploading ? "Uploading..." : "Upload File"
            }, void 0, false, {
                fileName: "[project]/components/admin/BulkUploadDeals.tsx",
                lineNumber: 102,
                columnNumber: 7
            }, this),
            result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: `mt-3 text-sm ${result.startsWith("✅") ? "text-green-600" : "text-red-600"}`,
                children: result
            }, void 0, false, {
                fileName: "[project]/components/admin/BulkUploadDeals.tsx",
                lineNumber: 113,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/admin/BulkUploadDeals.tsx",
        lineNumber: 92,
        columnNumber: 5
    }, this);
}
_s(BulkUploadDeals, "HG8sdl777tOPI4dNtCRbdXxsLtY=");
_c = BulkUploadDeals;
var _c;
__turbopack_context__.k.register(_c, "BulkUploadDeals");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/admin/SeasonalEventsManager.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>SeasonalEventsManager
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function SeasonalEventsManager() {
    _s();
    const [events, setEvents] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [newName, setNewName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [newStart, setNewStart] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [newEnd, setNewEnd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    // -----------------------------
    // Load events
    // -----------------------------
    const fetchEvents = async ()=>{
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/holiday-events");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load events");
            setEvents(data || []);
        } catch (e) {
            setError(e.message);
        } finally{
            setLoading(false);
        }
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "SeasonalEventsManager.useEffect": ()=>{
            fetchEvents();
        }
    }["SeasonalEventsManager.useEffect"], []);
    // -----------------------------
    // Toggle Active
    // -----------------------------
    const toggleActive = async (ev)=>{
        try {
            const res = await fetch("/api/holiday-events", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: ev.id,
                    is_active: !ev.is_active
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to update");
            setEvents((prev)=>prev.map((e)=>e.id === ev.id ? {
                        ...e,
                        is_active: !e.is_active
                    } : e));
        } catch (err) {
            alert(`❌ ${err.message}`);
        }
    };
    // -----------------------------
    // Create new event
    // -----------------------------
    const createEvent = async (e)=>{
        e.preventDefault();
        if (!newName.trim()) return alert("Event name is required");
        try {
            const res = await fetch("/api/holiday-events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: newName,
                    start_date: newStart || null,
                    end_date: newEnd || null,
                    is_active: false
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create event");
            setEvents((prev)=>[
                    ...prev,
                    data.event
                ]);
            setNewName("");
            setNewStart("");
            setNewEnd("");
        } catch (err) {
            alert(`❌ ${err.message}`);
        }
    };
    // -----------------------------
    // Elegant UI (Option C)
    // -----------------------------
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white border border-gray-200 rounded-md p-6 shadow-sm max-w-3xl",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                className: "text-2xl font-semibold text-blue-600 mb-2",
                children: "Seasonal Events Manager"
            }, void 0, false, {
                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                lineNumber: 111,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                onSubmit: createEvent,
                className: "mb-6 space-y-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-3 gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "text",
                                placeholder: "Event name",
                                className: "input",
                                value: newName,
                                onChange: (e)=>setNewName(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                lineNumber: 118,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "date",
                                className: "input",
                                value: newStart,
                                onChange: (e)=>setNewStart(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                lineNumber: 125,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "date",
                                className: "input",
                                value: newEnd,
                                onChange: (e)=>setNewEnd(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                lineNumber: 131,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                        lineNumber: 117,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "submit",
                        className: "px-4 py-2 bg-blue-600 text-white rounded-md text-sm",
                        children: "Add Event"
                    }, void 0, false, {
                        fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                        lineNumber: 138,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-gray-500",
                children: "Loading events..."
            }, void 0, false, {
                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                lineNumber: 148,
                columnNumber: 9
            }, this) : error ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-red-500",
                children: error
            }, void 0, false, {
                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                lineNumber: 150,
                columnNumber: 9
            }, this) : events.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-gray-500",
                children: "No events defined yet."
            }, void 0, false, {
                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                lineNumber: 152,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6",
                children: events.map((event)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: `relative rounded-xl p-5 border bg-white shadow-sm
        transition hover:shadow-md hover:-translate-y-1
        ${event.is_active ? "border-blue-300" : "border-gray-300 opacity-85"}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: async ()=>{
                                    if (!confirm(`Delete event "${event.name}"?`)) return;
                                    try {
                                        const res = await fetch("/api/holiday-events", {
                                            method: "DELETE",
                                            headers: {
                                                "Content-Type": "application/json"
                                            },
                                            body: JSON.stringify({
                                                id: event.id
                                            })
                                        });
                                        let data = null;
                                        try {
                                            data = await res.json(); // Safe attempt
                                        } catch (e) {}
                                        if (!res.ok) {
                                            throw new Error(data?.error || "Failed to delete");
                                        }
                                        setEvents((prev)=>prev.filter((e)=>e.id !== event.id));
                                    } catch (err) {
                                        alert(`❌ ${err.message}`);
                                    }
                                },
                                className: "absolute top-3 right-3 text-gray-400 hover:text-red-500 transition",
                                title: "Delete event",
                                children: "🗑️"
                            }, void 0, false, {
                                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                lineNumber: 163,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-start pr-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-3xl select-none",
                                        children: "📅"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                        lineNumber: 197,
                                        columnNumber: 9
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>toggleActive(event),
                                        className: `relative inline-flex h-6 w-11 rounded-full transition-colors duration-200
            ${event.is_active ? "bg-blue-600" : "bg-gray-300"}`,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform
              ${event.is_active ? "translate-x-5" : "translate-x-0"}`
                                        }, void 0, false, {
                                            fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                            lineNumber: 205,
                                            columnNumber: 11
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                        lineNumber: 200,
                                        columnNumber: 9
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                lineNumber: 196,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "mt-3 text-lg font-semibold text-gray-800",
                                children: event.name
                            }, void 0, false, {
                                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                lineNumber: 213,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4 flex items-center gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center border rounded-lg px-3 py-2 shadow-sm bg-gray-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-gray-500 uppercase",
                                                children: "Start"
                                            }, void 0, false, {
                                                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                                lineNumber: 221,
                                                columnNumber: 5
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "date",
                                                defaultValue: event.start_date || "",
                                                onChange: (e)=>setEvents((prev)=>prev.map((x)=>x.id === event.id ? {
                                                                ...x,
                                                                start_date: e.target.value
                                                            } : x)),
                                                className: "mt-1 w-10 text-sm text-gray-800 bg-transparent outline-none border border-gray-300 rounded px-1 py-0.5"
                                            }, void 0, false, {
                                                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                                lineNumber: 222,
                                                columnNumber: 4
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                        lineNumber: 220,
                                        columnNumber: 3
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-gray-400",
                                        children: "—"
                                    }, void 0, false, {
                                        fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                        lineNumber: 236,
                                        columnNumber: 3
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-center border rounded-lg px-3 py-2 shadow-sm bg-gray-50",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-gray-500 uppercase",
                                                children: "End"
                                            }, void 0, false, {
                                                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                                lineNumber: 240,
                                                columnNumber: 5
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "date",
                                                defaultValue: event.end_date || "",
                                                onChange: (e)=>setEvents((prev)=>prev.map((x)=>x.id === event.id ? {
                                                                ...x,
                                                                end_date: e.target.value
                                                            } : x)),
                                                className: "mt-1 w-10 text-sm text-gray-800 bg-transparent outline-none border border-gray-300 rounded px-1 py-0.5"
                                            }, void 0, false, {
                                                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                                lineNumber: 241,
                                                columnNumber: 4
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                        lineNumber: 239,
                                        columnNumber: 3
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                lineNumber: 218,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-4",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: `px-3 py-1 rounded-full text-xs font-medium
            ${event.is_active ? "bg-blue-100 text-blue-700" : "bg-gray-200 text-gray-600"}`,
                                    children: event.is_active ? "ACTIVE" : "INACTIVE"
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                    lineNumber: 260,
                                    columnNumber: 9
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                lineNumber: 259,
                                columnNumber: 7
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-3",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: async ()=>{
                                        try {
                                            const res = await fetch("/api/holiday-events", {
                                                method: "PUT",
                                                headers: {
                                                    "Content-Type": "application/json"
                                                },
                                                body: JSON.stringify({
                                                    id: event.id,
                                                    start_date: event.start_date,
                                                    end_date: event.end_date
                                                })
                                            });
                                            const data = await res.json();
                                            if (!res.ok) throw new Error(data.error || "Failed to update dates");
                                            alert("Dates updated!");
                                        } catch (err) {
                                            alert(`❌ ${err.message}`);
                                        }
                                    },
                                    className: "px-3 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700",
                                    children: "Save Dates"
                                }, void 0, false, {
                                    fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                    lineNumber: 272,
                                    columnNumber: 3
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                                lineNumber: 271,
                                columnNumber: 4
                            }, this)
                        ]
                    }, event.id, true, {
                        fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                        lineNumber: 156,
                        columnNumber: 5
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
                lineNumber: 154,
                columnNumber: 8
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/admin/SeasonalEventsManager.tsx",
        lineNumber: 110,
        columnNumber: 5
    }, this);
}
_s(SeasonalEventsManager, "LL+0wVV/Ur39LQjBKhXtvanKyG8=");
_c = SeasonalEventsManager;
var _c;
__turbopack_context__.k.register(_c, "SeasonalEventsManager");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/admin/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>AdminPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$DealsForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/admin/DealsForm.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$CatalogForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/admin/CatalogForm.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$CouponForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/admin/CouponForm.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$DealsList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/admin/DealsList.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$CatalogList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/admin/CatalogList.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$CouponList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/admin/CouponList.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$BulkUploadDeals$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/admin/BulkUploadDeals.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$SeasonalEventsManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/admin/SeasonalEventsManager.tsx [app-client] (ecmascript)");
(()=>{
    const e = new Error("Cannot find module '@/components/admin/AdminAnaltics'");
    e.code = 'MODULE_NOT_FOUND';
    throw e;
})();
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
function AdminPage() {
    _s();
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("deals");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "relative min-h-screen bg-gray-50 p-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: async ()=>{
                    await fetch("/api/logout", {
                        method: "POST"
                    });
                    window.location.href = "/login";
                },
                className: "absolute top-4 right-4 text-sm text-gray-600 hover:text-red-600",
                children: "Logout"
            }, void 0, false, {
                fileName: "[project]/app/admin/page.tsx",
                lineNumber: 20,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                className: "text-3xl font-bold text-blue-600 mb-4",
                children: "Admin Dashboard"
            }, void 0, false, {
                fileName: "[project]/app/admin/page.tsx",
                lineNumber: 31,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-gray-700 mb-6",
                children: [
                    "Manage your ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Deals"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.tsx",
                        lineNumber: 35,
                        columnNumber: 21
                    }, this),
                    ", ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Catalogs"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.tsx",
                        lineNumber: 35,
                        columnNumber: 45
                    }, this),
                    ", and",
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                        children: "Coupons"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.tsx",
                        lineNumber: 36,
                        columnNumber: 9
                    }, this),
                    "."
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-b border-gray-200 mb-6 flex space-x-6",
                children: [
                    {
                        id: "deals",
                        label: "🔥 Deals"
                    },
                    {
                        id: "catalogs",
                        label: "🗂️ Catalogs"
                    },
                    {
                        id: "coupons",
                        label: "🎟️ Coupons"
                    },
                    {
                        id: "events",
                        label: "📅 Seasonal Events"
                    },
                    {
                        id: "analytics",
                        label: "Analytics"
                    }
                ].map((tab)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: ()=>setActiveTab(tab.id),
                        className: `pb-2 text-lg font-medium border-b-2 ${activeTab === tab.id ? "border-blue-500 text-blue-600" : "border-transparent text-gray-500 hover:text-blue-500"} transition`,
                        children: tab.label
                    }, tab.id, false, {
                        fileName: "[project]/app/admin/page.tsx",
                        lineNumber: 48,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/admin/page.tsx",
                lineNumber: 40,
                columnNumber: 7
            }, this),
            activeTab === "deals" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$DealsForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/app/admin/page.tsx",
                        lineNumber: 65,
                        columnNumber: 3
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$BulkUploadDeals$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/app/admin/page.tsx",
                        lineNumber: 66,
                        columnNumber: 4
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                        href: "/templates/deals-template.xlsx",
                        download: true,
                        className: "ml-3 text-blue-600 underline text-sm hover:text-blue-800",
                        children: "Download Template"
                    }, void 0, false, {
                        fileName: "[project]/app/admin/page.tsx",
                        lineNumber: 67,
                        columnNumber: 4
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$DealsList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/app/admin/page.tsx",
                        lineNumber: 75,
                        columnNumber: 3
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.tsx",
                lineNumber: 64,
                columnNumber: 5
            }, this),
            activeTab === "catalogs" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$CatalogForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/app/admin/page.tsx",
                        lineNumber: 81,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$CatalogList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/app/admin/page.tsx",
                        lineNumber: 82,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.tsx",
                lineNumber: 80,
                columnNumber: 3
            }, this),
            activeTab === "coupons" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$CouponForm$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/app/admin/page.tsx",
                        lineNumber: 88,
                        columnNumber: 5
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$CouponList$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                        fileName: "[project]/app/admin/page.tsx",
                        lineNumber: 89,
                        columnNumber: 5
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/admin/page.tsx",
                lineNumber: 87,
                columnNumber: 3
            }, this),
            activeTab === "events" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$admin$2f$SeasonalEventsManager$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                    fileName: "[project]/app/admin/page.tsx",
                    lineNumber: 94,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/admin/page.tsx",
                lineNumber: 93,
                columnNumber: 9
            }, this),
            activeTab === "analytics" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AdminAnaltics, {}, void 0, false, {
                    fileName: "[project]/app/admin/page.tsx",
                    lineNumber: 100,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/admin/page.tsx",
                lineNumber: 99,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/admin/page.tsx",
        lineNumber: 18,
        columnNumber: 5
    }, this);
}
_s(AdminPage, "3AiqTsqYFzWJWycJJy5FSPigz+Q=");
_c = AdminPage;
/* ------------------ Reusable Styles ------------------ */ function Input({ placeholder }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
        placeholder: placeholder,
        className: "w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
    }, void 0, false, {
        fileName: "[project]/app/admin/page.tsx",
        lineNumber: 114,
        columnNumber: 5
    }, this);
}
_c1 = Input;
var _c, _c1;
__turbopack_context__.k.register(_c, "AdminPage");
__turbopack_context__.k.register(_c1, "Input");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_7cc0e224._.js.map