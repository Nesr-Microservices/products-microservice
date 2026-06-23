import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
    PORT: number;
    DATABASE_URL: string;
}

const envsSchema = joi.object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
})
.unknown(true);

const { error, value } = envsSchema.validate( process.env );

if ( error ) { 
    throw new Error(`Config validate error: ${ error.message }`);
}

const EnvVars: EnvVars = value;

export const envs = {
    port: EnvVars.PORT,
    databaseUrl: EnvVars.DATABASE_URL,
}