"user strict";

// libraries
const { Router, json } = require("express");
const multer = require("multer");
const upload = multer();
const router = Router();
const authGuard = require("../middlewares/auth-guard");

// cases
const { sendResponse } = require("../utils/send-response");
const {
    getAllPosts,
    getPostById,
    getTourByID,
    deletePost,
    deleteTour,
    getPhotoIDfromPostID,
    getPhotoIDfromTourID,
    getUserById,
    getNewsletter,
} = require("../services/db-service");
const { invalidCredentials } = require("../services/error-service");
const newPost = require("../controllers/post/new-post");
const editPost = require("../controllers/post/edit-post");
const createTour = require("../controllers/post/create-tour");
const editTour = require("../controllers/post/edit-tour");
const addPhotoToPost = require("../controllers/post/add-post-photo");
const addPhotoToTour = require("../controllers/post/add-tour-photo");
const deleteType = require("../controllers/post/delete-type");
const { deleteFile } = require("../services/file-service");
const { dibMail } = require("../services/mailer");

router.get("/dibposts", async (req, res) => {
    const posts = await getAllPosts();
    sendResponse(res, posts);
});

router.get("/dibposts/:id", async (req, res) => {
    const post = await getPostById(req.params.id);
    sendResponse(res, post);
});

router.post("/dibposts", authGuard, json(), async (req, res) => {
    if (!req.currentUser) {
        throw invalidCredentials();
    }
    const token = req.currentUser.token;
    const post = await newPost(req.body, token, res);
    const buildResponse = { ...req.body, ...post.post };
    sendResponse(res, buildResponse, undefined, 200);
});

router.put("/dibposts/:id", authGuard, json(), async (req, res) => {
    if (!req.currentUser) {
        throw invalidCredentials();
    }
    const idPost = req.params.id;
    const idUser = req.currentUser.id;
    const payload = req.body;
    await editPost(idPost, idUser, payload);
    sendResponse(res, payload);
});

router.post("/tour", authGuard, json(), async (req, res) => {
    if (!req.currentUser) {
        throw invalidCredentials();
    }
    const token = req.currentUser.token;
    const tourDate = await createTour(req.body, token);
    sendResponse(res, tourDate);
});

router.put("/tour/:id", authGuard, json(), async (req, res) => {
    const idTour = req.params.id;
    const tour = req.body;
    const newTourDate = await editTour(idTour, tour);
    sendResponse(res, newTourDate);
});

router.put(
    "/dibposts/:id/photos",
    authGuard,
    upload.array("photos", 10),
    async (req, res) => {
        const photos = req.files;
        const method = "post";
        const sendPhotos = await addPhotoToPost(
            method,
            req.params.id,
            req.currentUser.id,
            photos
        );
        sendResponse(res, sendPhotos);
    }
);

router.put(
    "/tour/:id/photos",
    authGuard,
    upload.array("photos", 10),
    async (req, res) => {
        const photos = req.files;
        const method = "tour";
        const sendPhotos = await addPhotoToTour(
            method,
            req.params.id,
            req.currentUser.id,
            photos
        );
        sendResponse(res, sendPhotos);
    }
);

router.delete("/post/:id", authGuard, json(), async (req, res) => {
    if (!req.currentUser) {
        throw invalidCredentials();
    }
    const idUser = req.currentUser.id;
    const post = await getPostById(req.params.id);
    const photos = await getPhotoIDfromPostID(req.params.id);
    if (post.idUser !== idUser) {
        invalidCredentials();
    }
    // delete files and database entry
    const type = "post";
    const endpoint = "full";
    if (photos.length > 0) {
        await deleteType(endpoint, type, req.params.id, photos[0].idPhoto);
    }
    // delete post from database
    const del = await deletePost(req.params.id);
    sendResponse(res, del);
});

router.delete("/tour/:id", authGuard, json(), async (req, res) => {
    const idUser = req.currentUser.id;
    const userRole = await getUserById(idUser);
    if (!req.currentUser || userRole.role !== "Admin") {
        throw new Error("INVALID_CREDENTIALS");
    }

    await getTourByID(req.params.id);
    const photos = await getPhotoIDfromTourID(req.params.id);
    // delete files and database entry
    const type = "tour";
    const endpoint = "full";
    if (photos.length > 0) {
        await deleteType(endpoint, type, req.params.id, photos[0].idPhoto);
    }
    // delete post from database
    await deleteTour(req.params.id);
    sendResponse(res);
});

router.delete("/post/:id/:idPhoto", authGuard, json(), async (req, res) => {
    if (!req.currentUser) {
        throw invalidCredentials();
    }
    // id de la foto
    const idPhoto = req.params.idPhoto.replace(".webp", "");
    // id del post
    const idType = req.params.id;
    const type = "post";
    const endpoint = "unique";

    // delete photos:
    const deletePhoto = await deleteType(endpoint, type, idType, idPhoto);
    sendResponse(res, deletePhoto);
});

router.delete("/tour/:id/:idPhoto", authGuard, json(), async (req, res) => {
    const idUser = req.currentUser.id;
    const userRole = await getUserById(idUser);
    if (!req.currentUser || userRole.role !== "Admin") {
        throw new Error("INVALID_CREDENTIALS");
    }

    const idPhoto = req.params.idPhoto.replace(".webp", "");
    const idType = req.params.id;
    const type = "tour";
    const endpoint = "unique";

    // delete post from database
    await deleteType(endpoint, type, idType, idPhoto);
    sendResponse(res);
});

// email
router.post("/send-email", authGuard, json(), async (req, res) => {
    const suscribers = await getNewsletter();
    const mail = req.body;
    console.log(mail);
    await dibMail(mail, suscribers);
    // Add image mail
    sendResponse(res, mail);
});

module.exports = router;
