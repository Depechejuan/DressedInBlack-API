"user strict";

// libraries
const { Router, json } = require("express");

// cases
const validateBody = require("../middlewares/validate-body");
const { handleAsyncError } = require("../utils/handle-async-error");
const { login } = require("../controllers/user/login");
const { sendResponse } = require("../utils/send-response");
const { register } = require("../controllers/user/register");
const authGuard = require("../middlewares/auth-guard");
const controlPanel = require("../controllers/user/control-panel");
const {
    getFullUserById,
    getTour,
    getTourById,
} = require("../services/db-service");

const router = Router();

// GET
router.get("/news");

router.get("/about");

router.get("/tour", json(), async (req, res) => {
    const tour = await getTour();
    sendResponse(res, tour);
});

router.get("/tour/:id", json(), async (req, res) => {
    const tour = await getTourById(req.params.id);
    sendResponse(res, tour);
});

router.get("/video");

router.get("/rider");

router.get("/contact");

router.get("/users/:id", json(), async (req, res) => {
    const user = await getFullUserById(req.params.id);
    sendResponse(res, user);
});

// POST

router.post("/dibreg", json(), async (req, res) => {
    const result = await register(req.body);
    sendResponse(res, result);
});

router.post("/diblog", json(), async (req, res) => {
    try {
        const token = await login(req.body);
        sendResponse(res, token);
    } catch (err) {
        console.error(err);
        if (err.code === "INVALID_CREDENTIALS") {
            sendResponse(res, { error: "Invalid email or password" }, 400);
        } else {
            sendResponse(res, { error: "Internal Server Error" }, 500);
        }
    }
});

// PUT

router.put("/users/:id", authGuard, json(), async (req, res) => {
    const idUser = req.params.id;
    const userInfo = req.body;
    const info = await controlPanel(idUser, userInfo);
    sendResponse(res, info, undefined, 201);
});

module.exports = router;
