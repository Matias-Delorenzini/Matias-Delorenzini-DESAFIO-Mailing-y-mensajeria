import express from 'express';
const router = express.Router();

function privateRouteAuth(req, res, next) {
    if (req.session.user) {
        res.redirect("/profile");
    } else {
        next();
    }
}

function publicRouteAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}
   
router.get("/register", privateRouteAuth, (req,res) => {
    res.render("register")
})

router.get("/login", privateRouteAuth, (req,res) => {
    res.render("login")
})

router.get("/profile", publicRouteAuth, (req,res) => {
    const userData = req.session.user
    res.render('profile', { userData });
})

export default router;