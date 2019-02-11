// Allow fetch in node
import 'isomorphic-fetch';

// Import environment variables from dotenv
// We keep this in a separate file as there can be issues where the
// environment is not initialized before a variable is used. See:
// https://github.com/motdotla/dotenv/issues/133#issuecomment-255298822
import { config } from 'dotenv';
config();
