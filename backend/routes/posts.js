/**
 * API de Posts - Operaciones CRUD para el Feed Social
 *
 * GET    /api/posts           - Listar posts del feed
 * POST   /api/posts           - Crear nuevo post
 * GET    /api/posts?id=xxx    - Obtener un post específico
 * PUT    /api/posts           - Actualizar post (likes, saves)
 * DELETE /api/posts?id=xxx    - Eliminar post
 */
const { connectToDatabase } = require("../lib/mongodb");
const {
  validateAuth,
  handleCors,
  applyCors,
  errorResponse,
  successResponse,
} = require("../lib/auth");

const COLLECTION = "posts";

module.exports = async (req, res) => {
  applyCors(req, res);
  if (handleCors(req, res)) return;

  const auth = validateAuth(req);
  if (!auth.valid) {
    return errorResponse(res, 401, auth.error);
  }

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection(COLLECTION);

    // Crear índices (idempotente)
    await collection.createIndex({ id: 1 }, { unique: true });
    await collection.createIndex({ fechaCreacion: -1 });
    await collection.createIndex({ autorId: 1 });

    switch (req.method) {
      case "GET":
        return await handleGet(req, res, collection);
      case "POST":
        return await handlePost(req, res, collection);
      case "PUT":
        return await handlePut(req, res, collection);
      case "DELETE":
        return await handleDelete(req, res, collection);
      default:
        return errorResponse(res, 405, `Method ${req.method} not allowed`);
    }
  } catch (error) {
    console.error("❌ Error en API posts:", error);
    return errorResponse(res, 500, error.message);
  }
};

/**
 * GET - Listar posts o obtener uno específico
 */
async function handleGet(req, res, collection) {
  const { id, desde, limit = 50, page = 1 } = req.query;

  if (id) {
    const post = await collection.findOne({ id: Number(id) });
    if (!post) {
      return errorResponse(res, 404, "Publicación no encontrada");
    }
    return successResponse(res, post);
  }

  const query = {};
  if (desde) {
    query.fechaCreacion = { $gt: desde };
  }

  const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

  const posts = await collection
    .find(query)
    .sort({ fechaCreacion: -1 })
    .skip(skip)
    .limit(parseInt(limit, 10))
    .toArray();

  const total = await collection.countDocuments(query);

  return successResponse(res, {
    count: posts.length,
    total,
    page: parseInt(page, 10),
    posts,
  });
}

/**
 * POST - Crear nuevo post
 */
async function handlePost(req, res, collection) {
  const post = req.body;

  if (!post || !post.id || !post.contenido) {
    return errorResponse(res, 400, "Datos de publicación inválidos (id y contenido requeridos)");
  }

  const existing = await collection.findOne({ id: post.id });
  if (existing) {
    await collection.updateOne(
      { id: post.id },
      {
        $set: {
          ...post,
          syncedAt: new Date().toISOString(),
        },
      }
    );
    return successResponse(res, { action: "updated", id: post.id });
  }

  const doc = {
    ...post,
    syncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  await collection.insertOne(doc);
  return successResponse(res, { action: "created", id: post.id }, 201);
}

/**
 * PUT - Actualizar post existente
 */
async function handlePut(req, res, collection) {
  const post = req.body;

  if (!post || !post.id) {
    return errorResponse(res, 400, "ID de publicación requerido");
  }

  const result = await collection.updateOne(
    { id: post.id },
    {
      $set: {
        ...post,
        syncedAt: new Date().toISOString(),
      },
    },
    { upsert: true }
  );

  return successResponse(res, {
    action: result.upsertedCount > 0 ? "created" : "updated",
    id: post.id,
    modifiedCount: result.modifiedCount,
  });
}

/**
 * DELETE - Eliminar post
 */
async function handleDelete(req, res, collection) {
  const { id } = req.query;

  if (!id) {
    return errorResponse(res, 400, "ID de publicación requerido");
  }

  const result = await collection.deleteOne({ id: Number(id) });

  if (result.deletedCount === 0) {
    return errorResponse(res, 404, "Publicación no encontrada");
  }

  return successResponse(res, {
    action: "deleted",
    id,
    deletedCount: result.deletedCount,
  });
}
