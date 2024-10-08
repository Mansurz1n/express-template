import {Request, RequestHandler, Response} from "express";
import { request } from "http";
/*
    Nampespace que contém tudo sobre "contas de usuários"
*/
export namespace AccountsHandler {
    
    /**
     * Tipo UserAccount
     */
    export type UserAccount = {
        name:string;
        email:string;
        password:string;
        birthdate:string; 
    };

    // Array que representa uma coleção de contas. 
    let accountsDatabase: UserAccount[] = [];

    /**
     * Salva uma conta no banco de dados. 
     * @param ua conta de usuário do tipo @type {UserAccount}
     * @returns @type { number } o código da conta cadastrada como posição no array.
     */
    export function saveNewAccount(ua: UserAccount) : number{
        accountsDatabase.push(ua);
        return accountsDatabase.length;
    }

    export function verifica(email:string|undefined) :boolean{
        let exists:boolean = false;
        accountsDatabase.find(a=>{
            if(email===a.email)
                exists=true;
                return 
        });
        return exists;
    }
    /**
     * Função para tratar a rota HTTP /signUp. 
     * @param req Requisição http tratada pela classe @type { Request } do express
     * @param res Resposta http a ser enviada para o cliente @type { Response }
     */
    export const createAccountRoute: RequestHandler = (req: Request, res: Response) => {
        // Passo 1 - Receber os parametros para criar a conta
        const pName = req.get('name');
        const pEmail = req.get('email');
        const pPassword = req.get('password');
        const pBirthdate = req.get('birthdate');
        if(!verifica(pEmail)){
            if(pName && pEmail && pPassword && pBirthdate){
                // prosseguir com o cadastro... 
                const newAccount: UserAccount = {
                    name: pName,
                    email: pEmail, 
                    password: pPassword,
                    birthdate: pBirthdate
                }
                const ID = saveNewAccount(newAccount);
                res.statusCode = 200; 
                res.send(`Nova conta adicionada. Código: ${ID}`);
            }else{
                res.statusCode = 400;
                res.send("Parâmetros inválidos ou faltantes.");
            }
        }
        else{
            res.statusCode = 400;
            res.send("Email ja registrado")
        }
        
    } 
    export function login(req:Request, res:Response){
        const c=req.get('Email');
        const b= req.get('Senha')
        var a=verifica(c);
        if(a===false){

        }else{
            
        

        }

    }
}
