const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');

const MAX_IMAGE_SIZE = 1.5 * 1024 * 1024; // 1.5MB em bytes (Base64 ~2MB no JSON)

exports.getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true, name: true, username: true, profileImage: true,
        totalPoints: true, level: true, role: true, createdAt: true
      }
    });

    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (error) { next(error); }
};

exports.updateMe = async (req, res, next) => {
  try {
    const { name, username, password, profileImage } = req.body;
    const data = {};

    if (name) {
      if (name.trim().length < 2) return res.status(400).json({ error: 'Nome deve ter ao menos 2 caracteres.' });
      data.name = name.trim();
    }

    if (username) {
      if (!/^[a-zA-Z0-9_]{3,30}$/.test(username.trim()))
        return res.status(400).json({ error: 'Username inválido.' });
      const exists = await prisma.user.findFirst({ where: { username: username.trim(), NOT: { id: req.userId } } });
      if (exists) return res.status(400).json({ error: 'Username já está em uso.' });
      data.username = username.trim();
    }

    if (password) {
      if (password.length < 6) return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
      data.password = await bcrypt.hash(password, 12);
    }

    if (profileImage !== undefined) {
      if (profileImage === null || profileImage === '') {
        data.profileImage = null; // Remover foto
      } else {
        // Valida que é Base64 de imagem (jpg, png, webp)
        const validPrefixes = ['data:image/jpeg;base64,', 'data:image/png;base64,', 'data:image/webp;base64,'];
        const isValid = validPrefixes.some(p => profileImage.startsWith(p));
        if (!isValid) return res.status(400).json({ error: 'Formato de imagem inválido. Use JPG, PNG ou WEBP.' });

        // Valida tamanho (~1.5MB de dados binários = ~2MB em Base64)
        const base64Data = profileImage.split(',')[1] || '';
        const sizeInBytes = (base64Data.length * 3) / 4;
        if (sizeInBytes > MAX_IMAGE_SIZE)
          return res.status(400).json({ error: 'Imagem muito grande. Máximo: 1.5MB.' });

        data.profileImage = profileImage;
      }
    }

    if (Object.keys(data).length === 0)
      return res.status(400).json({ error: 'Nenhuma alteração informada.' });

    const user = await prisma.user.update({
      where: { id: req.userId },
      data,
      select: {
        id: true, name: true, username: true, profileImage: true,
        totalPoints: true, level: true, role: true, createdAt: true
      }
    });

    res.json(user);
  } catch (error) { next(error); }
};
