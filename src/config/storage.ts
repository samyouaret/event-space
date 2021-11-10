import { root_path } from '../helpers/pathHelper';

export default {
    publicPath: root_path("public/storage"),
    // storeType: "disk",
    storeType: "s3",
}