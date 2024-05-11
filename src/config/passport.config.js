import passport from "passport";
import local from "passport-local";
import Users from "../dao/mongo/users.mongo.js"; 
import Carts from "../dao/mongo/carts.mongo.js";
import { createHash, isValidPassword } from "../utils.js";

const LocalStrategy = local.Strategy;
const initializePassport = () => {
    
    const usersService = new Users(); 
    const cartsService = new Carts();

    passport.use("register", new LocalStrategy(
        {passReqToCallback:true,usernameField:"email"},async (req,username,password,done) => {
            const {first_name,last_name,email,age} = req.body
            try{
                const user = await usersService.getOne(username); 
                if(user){
                    console.log("User already exists")
                    return done(null,false);
                }
                const newUser = {
                    first_name,
                    last_name,
                    email,
                    age,
                    cart: email+"_cart",
                    password:createHash(password)
                }
                const cartId = newUser.cart
            
                let result = await usersService.post(newUser); 
                let cartResult = await cartsService.post(cartId)
                return done(null,result,cartResult)
            }catch(error){
                return done("Error al obtener el usuario: "+error)
            }
        }
    ))

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });
    
    passport.deserializeUser(async (id, done) => {
        try {
            const user = await usersService.getOne(id);
            done(null, user);
        } catch (error) {
            done(error);
        }
    });
    

    passport.use("login", new LocalStrategy({usernameField:"email"}, async (username, password, done) => {
        try {
            const user = await usersService.getOne(username);
            if (!user) {
                console.log("User doesn't exist")
                return done(null, false);
            }    
            if (!isValidPassword(user, password)) return done(null, false);
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));
    
}
export default initializePassport;
