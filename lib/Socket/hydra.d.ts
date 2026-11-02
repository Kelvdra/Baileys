import { proto } from "../../WAProto/index.js";

export type HydraMessageType = 'PAYMENT' | 'PRODUCT' | 'INTERACTIVE_BUTTONS' | 'INTERACTIVE' | 'ALBUM' | 'EVENT' | 'POLL_RESULT' | 'STATUS_MENTION' | 'ORDER' | 'GROUP_STATUS' | 'CAROUSEL' | 'STICKER_PACK' | 'AIRICH' | 'MOTION';
declare class hydra {
    private utils;
    private relayMessage;
    private waUploadToServer;
    private config;
    private sock;
    constructor(utils: any, waUploadToServer: any, relayMessageFn: any, config?: any, sock?: any);
    detectType(content: any): HydraMessageType | null;
    handleCarousel(content: any, jid: string, quoted: any): Promise<any>;
    handleStickerPack(stickerPack: any, jid: string, quoted: any): Promise<any>;
    handlePayment(content: any, quoted: any): Promise<{
        requestPaymentMessage: proto.Message.RequestPaymentMessage;
    }>;
    handleProduct(content: any, jid: string, quoted: any): Promise<any>;
    handleInteractive(content: any, jid: string, quoted: any): Promise<any>;
    /** Ported from dugong.js: handles the separate `interactiveButtons` content shape. */
    handleInteractiveButtons(content: any, jid: string, quoted: any): Promise<any>;
    handleAlbum(content: any, jid: string, quoted: any): Promise<any>;
    handleEvent(content: any, jid: string, quoted: any): Promise<any>;
    handlePollResult(content: any, jid: string, quoted: any): Promise<any>;
    /** Posting status (image/video) dengan mention ke `jid`, lalu kirim notifikasi mention. Mengembalikan pesan notifikasi. */
    handleStMention(content: {
        statusMentionMessage: {
            image?: any;
            video?: any;
            caption?: string;
            mentions?: string | string[];
        };
    }, jid: string, quoted?: any): Promise<any>;
    /** Kirim video sebagai motion (GIF-like); dipanggil sendMessage saat `{ video, motion: true }`. */
    handleMotion(content: any, jid: string, quoted: any): Promise<any>;
    handleOrderMessage(content: any, jid: string, quoted: any): Promise<any>;
    /** Mengembalikan id pesan (string). Lewat sendMessage hasilnya dibungkus jadi { key, message }. */
    handleGroupStory(content: { groupStatus: Record<string, any> }, jid: string, quoted?: any): Promise<string>;
    /** Shorthand handler for `sock.sendMessage(jid, { aiRich: { ... } })`, builds an AIRich instance under the hood. */
    handleAIRich(content: any, jid: string, quoted: any): Promise<any>;
    /** Ported from dugong.js: sends a WhatsApp Status update, optionally notifying specific jids/groups via mention. */
    sendStatusWhatsApp(content: any, jids?: string[]): Promise<any>;
}
export default hydra;
