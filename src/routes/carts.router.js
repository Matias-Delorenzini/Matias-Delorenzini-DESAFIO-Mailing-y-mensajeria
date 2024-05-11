import express from 'express';
import nodemailer from 'nodemailer';
const router = express.Router();
import { cartsService } from '../repositories/index.js';
import { productsService } from '../repositories/index.js';
import { ticketsService } from '../repositories/index.js';

import randomUniqueId from 'random-unique-id';

var smtpConfig = {
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: 'matiasdelorenc@gmail.com',
        pass: 'cbar ughw lyxd ocgw'
    }
};
var transporter = nodemailer.createTransport(smtpConfig);

function publicRouteAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

router.post('/addToCart', publicRouteAuth, async (req, res) => {
    const { productId } = req.query;
    const cartId = req.session.user.cart
    const result = await cartsService.addProductToCart(cartId, productId);
    res.json(result);
});

router.get('/', publicRouteAuth, async (req, res) => {
    try {
        const cartId = req.session.user.cart
        const cartDataString = await cartsService.findCartByID(cartId);
        const cartDataArray = JSON.parse(cartDataString);
        const cartData = cartDataArray[0];
        const productsData = cartData.products
        res.render('cart', { productsData });
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Error al obtener los datos del carrito: ' + error });
    }
});

router.post('/', publicRouteAuth, async (req, res) => {
    const { productId, quantityToAdd } = req.body;
    const cartId = req.session.user.cart
    await cartsService.increaseProductQuantity(cartId, productId, quantityToAdd);
    res.redirect("/api/cart");
});

router.delete("/clear", publicRouteAuth, async (req, res) => {
    const cartId = req.session.user.cart
    await cartsService.clearCart(cartId);
    res.redirect("/api/cart");
});

router.delete("/removeProduct/:productId", publicRouteAuth, async (req, res) => {
    try {
        const { productId } = req.params;
        const cartId = req.session.user.cart
        await cartsService.removeProductFromCart(cartId, productId);
        res.redirect("/api/cart");
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error al eliminar producto del carrito: ' + error.message });
    }
});

router.post('/purchase', publicRouteAuth, async (req, res) => {
    try {
        const cartId = req.session.user.cart;
        const cartData = await cartsService.findCartByID(cartId);
        const cart = JSON.parse(cartData);
        const products = cart[0].products;

        const insufficientStockProducts = [];
        const validProducts = [];
        let totalPrice = 0;

        for (const productInCart of products) {
            const { product: productId, quantity } = productInCart;
            const product = await productsService.getProductById(productId);
            const productStock = product.stock;
            if (quantity > productStock) {
                insufficientStockProducts.push(product);
            } else {
                validProducts.push(product);
				await productsService.updateStock(product.id, quantity);
				await cartsService.removeProductFromCart(cartId,product.id);
                totalPrice += product.price * quantity;
            }
        }

        if (insufficientStockProducts.length > 0) {
            console.log('Los siguientes productos no tienen stock suficiente:', insufficientStockProducts);
        }

		if (validProducts.length > 0){
			const uniqueId = randomUniqueId()
			const code = uniqueId.id

        	const newTicket = {
        	    code: code,
        	    amount: totalPrice,
        	    purchaser: JSON.stringify(req.session.user.email),
        	};

        	await ticketsService.createTicket(newTicket);

            const ticketData = await ticketsService.getTicketByCode(newTicket.code)
            const ticketArray = JSON.parse(ticketData);
            const ticket = ticketArray[0]

            let result = await transporter.sendMail({
                from:'Coder Tests matiasdelorenc@gmail.com',
                to:ticket.purchaser,
                subject:`Ticket de Compra ${ticket.code}`,
                html:`
                <h1>Confirmación de tu compra</h1>
                <p>¡Hola, ${req.session.user.first_name} ${req.session.user.last_name}! Tu compra fue realizada con éxito 😁</p>
                <h2>Información:</h2>
                <ul>
                    <li>Código: ${ticket.code}</li>
                    <li>Importe: $-${ticket.amount}</li>
                    <li>Comprador: ${ticket.purchaser}</li>
                    <li>Fecha de compra: ${ticket.purchase_datetime}</li>
                </ul>
                `,
                attachments:[]
            })

			res.redirect("/api/cart");
		} else {
			return insufficientStockProducts
		}
    } catch (error) {
        console.error('Error al realizar la compra:', error.message);
        res.status(500).json({ success: false, message: 'Error al procesar la compra.' });
    }
});

export default router;