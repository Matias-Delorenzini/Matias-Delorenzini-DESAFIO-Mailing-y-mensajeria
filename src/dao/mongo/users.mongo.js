import UsersModel from '../models/users.schema.js';

class Users {
    post = async(user) => {
        try {
            const newUser = new UsersModel(user);
            const savedUser = await newUser.save();
            return savedUser;
        } catch (error) {
            throw error;
        }
    }

    getOne = async(email) => {
        try {
            const user = await UsersModel.findOne({ email });
            return user;
        } catch (error) {
            throw error;
        }
    }
}

export default Users;
