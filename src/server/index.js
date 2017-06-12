import {actualServerPort} from './config';
import app from './app';

app.listen(actualServerPort, () => {
    console.info(`Listening on port ${actualServerPort}`);
});
