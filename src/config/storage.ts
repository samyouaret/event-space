import { env, root_path } from '../helpers/pathHelper';

export default {
    publicPath: root_path("public/storage"),
    // storeType: "disk",
    storeType: "s3",
}

export const Awsconfig = {
    credentials: {
        secretAccessKey: env("aws_secret_access_key"),
        accessKeyId: env('aws_access_key_id'),
        sessionToken: env("aws_session_token"),
        region: env("aws_region")
    },
    bucket_name: env("aws_s3_bucket"),
    region: env("aws_region")
}