import CartsModel from "../models/carts.schema.js";

class Carts {
    getOne = async(cartId) => {
        try {
            let cart = await CartsModel.find({cartId: cartId});
            let cartData = JSON.stringify(cart,null,"\t")
            if (!cart) {
                return { success: false, message: 'No se encontró el carrito especificado.' };
            }
    
            return cartData;
        } catch (error) {
            console.error('Error al obtener los datos del carrito:', error.message);
            return { success: false, message: ' Error al obtener los datos del carrito.' };
        }
    }  

    deleteElement = async(cartId, productId) => {
        try {
            let cartData = await this.getOne(cartId);
            let cart = JSON.parse(cartData,null,"\t")
            const productList = cart[0].products;
            const index = productList.findIndex(item => item.product._id === productId);
            if (index !== -1) {
                productList.splice(index, 1);
                cart[0].products = productList;
                await CartsModel.findOneAndUpdate( {cartId: cartId}, { products: cart[0].products });
                return { success: true, message: `Se eliminó el producto`};
            } else {
                return { success: false, message: `No se encontró ningún producto con productId ${productId}.`};
            }
        } catch (error) {
            console.error(' Error al eliminar producto del carrito:', error.message);
            return { success: false, message: 'Error al eliminar producto del carrito.' };
        }
    }
    
    addElement = async(cartId, productId) => {
        try {
            let cart = await CartsModel.findOne({ cartId: cartId })
            if (!cart) {
                return { success: false, message: 'No se encontró el carrito especificado.' };
            }
    
            const existingProductIndex = cart.products.findIndex(item => String(item.product._id) === String(productId));
    
            if (existingProductIndex !== -1) {
                return { success: false, message: 'El producto ya está en el carrito.' };
            }
    
            cart.products.push({ product: productId });
    
            await cart.save();
    
            return { success: true, message: 'Producto añadido al carrito exitosamente.' };
        } catch (error) {
            console.error('Error al añadir producto al carrito:', error.message);
            return { success: false, message: 'Error al añadir producto al carrito.' };
        }
    }
    
    increaseElementQuantity = async(cartId, productId, quantityToAdd) => {
        try {
            quantityToAdd = parseInt(quantityToAdd)
            if (quantityToAdd < 0) {
                return { success: false, message: 'No se puede aumentar un número negativo.' };;
            }
            let cart = await CartsModel.findOne({ cartId: cartId });            if (!cart) {
                return { success: false, message: 'No se encontró el carrito especificado.' };
            }

            const productIndex = cart.products.findIndex(item => String(item.product._id) === String(productId));

            if (productIndex !== -1) {
                cart.products[productIndex].quantity += quantityToAdd;                
                await cart.save();

                return { success: true, message: 'Cantidad del producto aumentada exitosamente.' };
            } else {
                return { success: false, message: 'El producto no se encontró en el carrito.' };
            }
        } catch (error) {
            console.error('Error al aumentar la cantidad del producto en el carrito:', error.message);
            return { success: false, message: 'Error al aumentar la cantidad del producto en el carrito.' };
        }
    }

    clear = async(cartId) => {
        try {
            await CartsModel.findOneAndUpdate({ cartId: cartId }, { products: [] });
            return { success: true, message: `Se vació el carrito`};
        } catch (error) {
            console.error('Error al vaciar el carrito:', error.message);
            return { success: false, message: 'Error al vaciar el carrito.' };
        }
    }

    post = async(id) => {
        try{
            const newCart = new CartsModel({cartId:id});
            const savedCart = await newCart.save();
            return savedCart;
        } catch(error) {
            throw error;
        }
    }

    compareStock = async(cartId, productId, desiredQuantity) => {
        try {
            const cart = await CartsModel.findOne({ cartId: cartId });
            if (!cart) {
                return false;
            }
    
            const product = cart.products.find(item => String(item.product._id) === String(productId));
            if (!product) {
                return false;
            }
    
            const stock = product.product.stock;
            const validQuantity = parseInt(desiredQuantity);
    
            if (isNaN(validQuantity) || validQuantity < 0) {
                return false;
            }
    
            return validQuantity <= stock;
        } catch (error) {
            console.error('Error comparing stock:', error.message);
            return false;
        }
    }
    
    async updateStock(cartId, productId, newStockValue) {
        try {
            const validNewStock = parseInt(newStockValue);
    
            if (isNaN(validNewStock) || validNewStock < 0) {
                throw new Error('Invalid new stock value');
            }
    
            const updatedCart = await CartsModel.findOneAndUpdate(
                { cartId: cartId, "products.product._id": productId },
                { "$set": { "products.$.product.stock": validNewStock } }
            );
    
            if (!updatedCart) {
                return false;
            }
    
            return true;
        } catch (error) {
            console.error('Error updating stock:', error.message);
            throw error;
        }
    }
}

export default Carts;