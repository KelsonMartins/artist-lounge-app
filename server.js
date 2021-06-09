import { createServer } from 'https';
import { fetchImageMetadata, createUser } from './shared/services';
import jsonBody from 'body/json';
import { readFileSync, createReadStream } from 'fs';
import { IncomingForm } from 'formidable';

const server = createServer({
    key: readFileSync('./certs/key.pem'),
    cert: readFileSync('./certs/cert.pem')
});

server.on('request', (request, response) => {
    request.on('error', (err) => {
        // console.error(err.message);
        response.statusCode = 500;
        response.write(`An error has occurred: ${err.message}`);
        response.end();
    });

    response.on('error', (err) => {
        // console.error(err.message);
        response.statusCode = 500;
        response.write(`An error has occurred: ${err.message}`);
        response.end();
    });

    // console.log(request.method, request.url);
    const parsedUrl = new URL(request.url);
    // console.log(parsedUrl);

    if (request.method === 'GET' && parsedUrl.pathname === '/metadata') {
        const id = parsedUrl.searchParams.get('id');
        // console.log(id);
        const metadata = fetchImageMetadata(id);
        response.setHeader('Content-Type', 'application/json');
        response.statusCode = 200;
        const serializedJSON = JSON.stringify(metadata);
        response.write(serializedJSON);
        response.end();
        // console.log(metadata);
        // console.log(request.headers);
    } else if (request.method === 'POST' && parsedUrl.pathname === '/users') {
        // const body = [];
        // request.on('data', (chunk) => {
        //     body.push(chunk);
        // }).on('end', () => {
        //     const parsedJson = JSON.parse(Buffer.concat(body));
        //     const userName = parsedJson[0]['UserName'];
        //     services.createUser(userName);
        // });
        jsonBody(request, response, (err, body) => {
            if (err) {
                console.log(err);
            } else {
                createUser(body['UserName']);
            }
        });
    } else if (request.method === 'POST' && parsedUrl.pathname === '/upload') {
        const form = new IncomingForm({
            uploadDir: __dirname,
            keepExtensions: true,
            multiples: true,
            maxFileSize: 5 * 1024 * 1024,
            encoding: 'utf-8',
            maxFields: 20
        });
        // form.parse(request, (err, fields, files) => {
        //     if (err) {
        //         console.log(err);
        //         response.statusCode = 500;
        //         response.end('Error!');
        //      } else {
        //         console.log('\n fields:');
        //         console.log(fields);
        //         console.log('\n files:');
        //         console.log(files);
        //         response.statusCode = 200;
        //         response.end('Success!');
        //     }
        // });
        form.parse(request)
            .on('fileBegin', (filename, file) => {
                console.log('Our upload has started');
            })
            .on('file', (filename, file) => {
                console.log('Field + file pair has been received.');
            })
            .on('field', (filename, fieldvalue) => {
                console.log('Field received:');
                console.log(filename, fieldvalue);
            })
            .on('progress', (bytesReceived, bytesExpected) => {
                console.log(bytesReceived + ' / ' + bytesExpected);
            })
            .on('error', (err) => {
                console.error(err);
                request.resume();
            })
            .on('aborted', () => {
                console.error('Requested aborted by the user!');
            })
            .on('end', () => {
                console.log('Done - request fully received!')
                response.end('Success!');
            })
    } else {
        // response.writeHead(404, {
        //     'X-Powered-By': 'Node',
        //     'Content-Type': 'application/json'
        // });
        // response.end();
        createReadStream('../index.html').pipe(response);
    }
});

server.listen(443);
