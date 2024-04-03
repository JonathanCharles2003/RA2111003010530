const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Sample data for e-commerce companies' APIs
const companies = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
const categories = ["Phone", "Computer", "TV", "Earphone", "Tablet", "Charger", "Mouse", "Keypad", "Bluetooth", "pendrive", "Remote", "Speaker", "Headset", "Laptop", "PC"];
const apiUrl = "http://20.244.56.144/test/companies/";

// Access token
const accessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzEyMTU0MTI2LCJpYXQiOjE3MTIxNTM4MjYsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6ImJkMTlhYzMwLTIxODQtNGNiMy1iZTViLTBjMWEyNjllMmJlNyIsInN1YiI6ImpiMjM2NkBzcm1pc3QuZWR1LmluIn0sImNvbXBhbnlOYW1lIjoiRXpLYXJ0IiwiY2xpZW50SUQiOiJiZDE5YWMzMC0yMTg0LTRjYjMtYmU1Yi0wYzFhMjY5ZTJiZTciLCJjbGllbnRTZWNyZXQiOiJ5aGZtbk9Ib3p1TGRnRlhuIiwib3duZXJOYW1lIjoiSm9uYXRoYW4gQ2hhcmxlcyIsIm93bmVyRW1haWwiOiJqYjIzNjZAc3JtaXN0LmVkdS5pbiIsInJvbGxObyI6IlJBMjExMTAwMzAxMDUzMCJ9.12WJcCj_m3oAyepLFIpKwPxh6F6FuRIB-VTuBC6mMvY";

// GET route for fetching top products
app.get('/categories/:categoryname/products', async (req, res) => {
    try {
        const { categoryname } = req.params;
        const { top, minPrice, maxPrice, sort } = req.query;
        const companyProductsPromises = companies.map(async (company) => {
            const response = await axios.get(`${apiUrl}${company}/categories/${categoryname}/products`, {
                params: {
                    top,
                    minPrice,
                    maxPrice,
                    sort
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });
            return response.data;
        });
        const companyProducts = await Promise.all(companyProductsPromises);
        let combinedProducts = [];
        companyProducts.forEach(products => {
            combinedProducts = combinedProducts.concat(products);
        });
        // Sorting combined products based on sorting criteria if provided
        if (sort) {
            combinedProducts.sort((a, b) => {
                const sortKey = sort.substring(1);
                if (sort[0] === '-') {
                    return b[sortKey] - a[sortKey];
                } else {
                    return a[sortKey] - b[sortKey];
                }
            });
        }
        // Paginating if top exceeds 10
        const pageNum = req.query.page || 1;
        const pageSize = top > 10 ? 10 : top;
        const startIndex = (pageNum - 1) * pageSize;
        const paginatedProducts = combinedProducts.slice(startIndex, startIndex + pageSize);
        res.json(paginatedProducts);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});


// Starting the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
