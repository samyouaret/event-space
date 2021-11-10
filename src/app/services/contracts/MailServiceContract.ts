export interface MailMessage {
    from: string,
    to: string,
    subject: string,
    text: string,
    html:string,
}

export interface Strategy {
    send(msg: MailMessage): void;
}

export interface MailServiceContract {
    strategy: Strategy;
}