import express from "express";
import cors from "cors";
import {Request, Response, Router} from "express";
import { AccountsHandler } from "./accounts/accounts";
import {EventsShow} from "./events/eventsShow";
import { WalletHandler } from "./wallet/wallet";
import { EventsHandler } from "./events/eventsN";





const port = 3000; 
const server = express();
const routes = Router();


server.use(cors());
routes.get('/', EventsShow.futuros);

// vamos organizar as rotas em outro local 





routes.get('/login', AccountsHandler.loginHandler);//!

routes.post('/newEvent',EventsHandler.CreateEvent);//!

routes.post('/signUp', AccountsHandler.createAccountRoute);//!

routes.patch('/updateEvent', EventsHandler.AvaliarEvento)//!

routes.get('/getWallet',WalletHandler.getWallet);

routes.get('/Search',EventsShow.SearchEvent);

routes.patch('/addFunds',WalletHandler.addfunds);

routes.patch('/withdrawFunds', WalletHandler.withdrawFunds)


routes.post('/betOnEvent', WalletHandler.betOnEvent);

routes.patch('/finishEvent', WalletHandler.finishEvent)

routes.patch('/DeleteEvent', EventsHandler.DeleteEvent)//!








routes.get('/events/ocoridos',EventsShow.ocoridos);
routes.get('/events/futuros',EventsShow.futuros);
routes.get('/events/nochek',EventsShow.nochek);

//routes.get('')






server.use(routes);

server.listen(port, ()=>{
    console.log(`Server is running on: ${port}`);
})