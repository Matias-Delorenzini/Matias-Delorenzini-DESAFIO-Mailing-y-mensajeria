import express from 'express';
const router = express.Router();
import ProductsModel from '../dao/models/products.schema.js';

export function authorize(role) {
    return (req, res, next) => {
        if (!req.session.user || req.session.user.role !== role) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
} 

function publicRouteAuth(req, res, next) {
    if (!req.session || !req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
}

router.get('/', publicRouteAuth, async (req, res) => {
    try {
        let limit = parseInt(req.query.limit) || 5;
        let page = req.query.page;
        let sort = req.query.sort;
        let query = req.query.query;

        if(!page){
            page = 1;
        }

        let result;

        let filters = {}
        let sortOptions = {};

        if (sort === 'asc' || sort === 'desc') {
            sortOptions = { price: sort };
        }

        if (query) {
            filters = { ...filters, category: query };
        }
        if (req.query.stock !== null && req.query.stock !== undefined) {
            filters = { ...filters, stock: { $gt: 0 } };
        }

        result = await ProductsModel.paginate(filters, { page, limit, lean: true, sort: sortOptions });

        result.prevLink = result.hasPrevPage ? `/api/products?page=${result.prevPage}` : '';
        result.nextLink = result.hasNextPage ? `/api/products?page=${result.nextPage}` : '';

        result.isValid = !(isNaN(page) || page <= 0 || page > result.totalPages);

        const userData = req.session.user
        res.render('products', { result, userData });
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Error al obtener los productos: ' + error.message });
    }
});

export default router;