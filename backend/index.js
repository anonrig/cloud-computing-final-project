import crypto from "node:crypto";
import fastify from "fastify";
import jwt from "@fastify/jwt";
import cors from '@fastify/cors'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const f = fastify({ logger: true });
const port = process.env.PORT || 3001;
const secret = process.env.SECRET || "my-super-secret-jwt-key";

async function authenticate(req, reply) {
	try {
		await req.jwtVerify();
		req.user = await prisma.user.findUnique({ where: { id: req.user.id } });
	} catch (err) {
		reply.send(err);
	}
}

f.register(jwt, { secret });
f.register(cors)

f.post(
	"/users/login",
	{
		schema: {
			body: {
				type: "object",
				properties: { username: { type: "string" }, password: { type: "string" } },
				required: ["username", "password"],
			},
			response: {
				200: {
					type: "object",
					properties: {
						token: { type: "string" },
					},
					required: ["token"],
				},
			},
		},
	},
	async ({ body }) => {
		const password = crypto
			.createHash("sha256")
			.update(body.password)
			.digest("base64");
		const user = await prisma.user.findFirst({
			where: { username: body.username, password },
		},);

		if (!user) {
			throw new Error("Missing/invalid password");
		}

		return {
			token: f.jwt.sign({ id: user.id }),
		};
	},
);

f.post(
	"/users/register",
	{
		schema: {
			body: {
				type: "object",
				properties: { username: { type: "string" }, password: { type: "string" } },
				required: ["username", "password"],
			},
			response: {
				200: {
					type: "object",
					properties: {
						token: { type: "string" },
					},
					required: ["token"],
				},
			},
		},
	},
	async ({ body }) => {
		const password = crypto
			.createHash("sha256")
			.update(body.password)
			.digest("base64");
		const user = await prisma.user.create({
			data: { username: body.username, password },
		},);

		if (!user) {
			throw new Error("Missing/invalid password");
		}

		return {
			token: f.jwt.sign({ id: user.id }),
		};
	},
);

f.get(
	"/items",
	{
		preHandler: [authenticate],
	},
	async (req) => {
		return { rows: await prisma.entry.findMany({ where: { userId: req.user.id }, orderBy: { completed: 'desc' } }) };
	},
);

f.post(
	"/items",
	{
		preHandler: [authenticate],
		schema: {
			body: {
				type: "object",
				properties: {
					text: { type: "string", minLength: 1 },
				},
				required: ["text"],
			},
			response: {
				200: {
					type: "object",
					properties: {
						status: { type: "boolean" },
					},
					required: ["status"],
				},
			},
		},
	},
	async ({ body, user }) => {
		await prisma.entry.create({ data: { ...body, userId: user.id } });
		return { status: true };
	},
);

f.delete(
	"/items/:id",
	{
		preHandler: [authenticate],
		schema: {
			response: {
				200: {
					type: "object",
					properties: {
						status: { type: "boolean" },
					},
					required: ["status"],
				},
			},
		},
	},
	async ({ params: { id } }) => {
		await prisma.entry.delete({ where: { id } });
		return { status: true };
	},
);

f.put(
	"/items/:id",
	{
		preHandler: [authenticate],
		schema: {
			response: {
				200: {
					type: "object",
					properties: {
						status: { type: "boolean" },
					},
					required: ["status"],
				},
			},
		},
	},
	async ({ params: { id } }) => {
		const entry = await prisma.entry.findUnique({ where: { id } });
		if (!entry) {
			return { status: false };
		}
		await prisma.entry.update({
			data: { completed: !entry.completed },
			where: { id },
		},);
		return { status: true };
	},
);

await prisma.$connect()
await f.listen({ port, host: "0.0.0.0" });
