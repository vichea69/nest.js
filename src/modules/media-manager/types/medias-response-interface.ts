//Multiple Media Response
import {MediaResponseInterface} from "@/modules/media-manager/types/media-response-interface";

export interface MediasResponseInterface {
    items: MediaResponseInterface[];
    total: number;
}