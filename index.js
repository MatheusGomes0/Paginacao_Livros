const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const conn_uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = 'livros';

app.use(
    cors({
        origin: "http://localhost:3000",
    })
);
app.use(express.json());

async function withDatabase(collectionName, callback) {
    const client = new MongoClient(conn_uri);
    try {
        await client.connect();
        const database = client.db(dbName);
        const collection = database.collection(collectionName);
        return await callback(collection);
    } finally {
        await client.close();
    }
}

// Inicio - rotas
app.get("/livros/:pag", async (req, res) => {
    const pag = parseInt(req.params.page);
    const skip = (pag - 1) * 10;
    try {
        const books = await withDatabase('livro', collection => 
            collection.find({}).skip(skip).limit(10).toArray()
        );
        res.json(books);
    } catch (error) {
        console.error("Um erro aconteceu ao procurar pelas informações dos livros: ", error);
        res.status(500).json({ message: `Um erro aconteceu ao procurar pelas informações dos livros:  ${error}` });
    }
});

app.get("/quant", async (req, res) => {
    try {
        const amount = await withDatabase('livro', collection => collection.countDocuments());
        res.json({ amount });
    } catch (error) {
        console.error("Um erro aconteceu enquanto estava contando os livros: ", error);
        res.status(500).json({ message: `Um erro aconteceu enquanto estava contando os livros: ${error}` });
    }
});

// Final - rotas

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});