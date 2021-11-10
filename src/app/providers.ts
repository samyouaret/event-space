import UserRepository from "./repositories/UserRepository";
import DiagnosticRepository from "./repositories/DiagnosticRepository";
import DiseasePostRepository from "./repositories/DiseasePostRepository";
import AuthService from "./services/AuthService";
import MailService from "./services/MailService";
import VerifyEmailService from "./services/VerifyEmailService";

export default {
   AuthService,
   UserRepository,
   DiagnosticRepository,
   DiseasePostRepository,
   MailService,
   VerifyEmailService,
}