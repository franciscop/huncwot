const chai = require('chai');
const chaiHttp = require('chai-http');

chai.use(chaiHttp);
const expect = chai.expect;

const Huncwot = require('../');
const { reply } = require('../helpers');

let app;
let server;

before(() => {
  app = new Huncwot();
  server = app.listen(3000);
});

describe('init', () => {
  it('GET / route, implict return', async () => {
    app.get('/', _ => 'Hello Huncwot')

    const response = await chai.request(server)
      .get('/');

    expect(response.text).to.eq('Hello Huncwot');
  });

  it('GET /explicit route, explicit assignment', async () => {
    app.get('/explicit', request => {
      return { body: `Hello Explicit Assignment` }
    })

    const response = await chai.request(server)
      .get('/explicit');

    expect(response.text).to.eq('Hello Explicit Assignment');
  });

  it('GET /json route', async () => {
    app.get('/json', _ => reply({ a: 1, b: 2 }))

    const response = await chai.request(server)
      .get('/json');

    expect(response.type).to.eq('application/json');
    expect(response.body).to.have.all.keys('a', 'b');
  })

  it('GET /hello/:foo route', async () => {
    app.get('/hello/:foo', _ => _.params.foo)

    const response = await chai.request(server)
      .get('/hello/world');

    expect(response.type).to.eq('text/plain');
    expect(response.text).to.eq('world');
  })

  it('POST /bim route, with params', async () => {
    app.post('/bim', context => {
      return `Hello ${context.params.name}!`
    })

    const response = await chai.request(server)
      .post('/bim')
      .send({ name: 'Zaiste' });

    expect(response.text).to.eq('Hello Zaiste!');
  })
});
