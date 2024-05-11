import UsersDTO from "../dao/DTOs/users.dto.js";
export default class UsersRepository {
    constructor (dao){
        this.dao = dao;
    }

    findUserByEmail = async (email) => {
        let result = await this.dao.getOne(email);
        return result;
    }

    createUser = async(user) => {
        let userToCreate = await this.dao.post(user);
        return userToCreate;  
    }

    createUserSession = async(user) => {
        let userSessionToCreate = new UsersDTO(user);
        return userSessionToCreate;
    }
}