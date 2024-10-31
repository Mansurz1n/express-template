import express from "express";
import {Request, Response, Router} from "express";
import { AccountsHandler } from "./accounts/accounts";
import {EventsHandler} from "./events/events";
import { WalletHandler } from "./wallet/wallet";




const port = 3000; 
const server = express();
const routes = Router();

// definir as rotas. 
// a rota tem um verbo/método http (GET, POST, PUT, DELETE)
routes.get('/', (req: Request, res: Response)=>{
    res.statusCode = 403;
    res.send('Acesso não permitido.');
});

// vamos organizar as rotas em outro local 





routes.get('/login', AccountsHandler.loginHandler);

routes.post('/newEvent',EventsHandler.CreateEvent);

routes.post('/signUp', AccountsHandler.createAccountRoute);

routes.patch('/updateEvent', EventsHandler.AvaliarEvento)




routes.get('/addFunds',WalletHandler.addfunds);

routes.get('/withdrawFunds', WalletHandler.withdrawFunds)


routes.get('/:id/betOnEvent/', WalletHandler.betOnEvent);

routes.get('/:id/finishEvent/', WalletHandler.finishEvent)
routes.delete('/DeleteEvent', EventsHandler.DeleteEvent)









routes.get('/events/ocoridos',EventsHandler.MostrarEventos.ocoridos);
routes.get('/events/futuros',EventsHandler.MostrarEventos.futuros);
routes.get('/events/nochek',EventsHandler.MostrarEventos.nochek);

//routes.get('')






server.use(routes);

server.listen(port, ()=>{
    console.log(`Server is running on: ${port}`);
})