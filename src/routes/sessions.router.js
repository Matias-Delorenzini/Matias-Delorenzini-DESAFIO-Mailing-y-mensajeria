import express from 'express';
import passport from 'passport';
import { usersService } from './../repositories/index.js';
const router = express.Router();

router.get("/current", (req, res) => {
    if (req.session.user) {
        res.status(200).json({ user: req.session.user });
    } else {
        res.status(401).json({ error: "Unauthorized" });
    }
});

router.post("/register", passport.authenticate("register", { failureRedirect: "/api/sessions/failregister" }), async (req, res) => {
    res.redirect("/login");
});
router.get("/failregister", async (req,res) => {
    console.log("Failed Strategy");
    res.redirect("/register");
})

router.post("/login", passport.authenticate("login", { failureRedirect: "/api/sessions/faillogin" }), async (req, res) => {
    if (!req.user) return res.status(400).send({ status: "error", error: "Invalid credentials" });

    req.session.user = await usersService.createUserSession(req.user)

    res.redirect("/api/products");
});

router.get("/faillogin",(req,res) => {
    res.redirect("/login");
})

router.post("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log("Error al hacer logout", err)
        } 
        res.redirect("/login");
    });
});

export default router;