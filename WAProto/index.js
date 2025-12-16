import Adv from './Adv/Adv.js';
import AICommon from './AICommon/AICommon.js';
import BotMetadata from './BotMetadata/BotMetadata.js';
import Cert from './Cert/Cert.js';
import ChatLockSettings from './ChatLockSettings/ChatLockSettings.js';
import CompanionReg from './CompanionReg/CompanionReg.js';
import DeviceCapabilities from './DeviceCapabilities/DeviceCapabilities.js';
import E2E from './E2E/E2E.js';
import Ephemeral from './Ephemeral/Ephemeral.js';
import HistorySync from './HistorySync/HistorySync.js';
import LidMigrationSyncPayload from './LidMigrationSyncPayload/LidMigrationSyncPayload.js';
import MdStorageChatRowOpaqueData from './MdStorageChatRowOpaqueData/MdStorageChatRowOpaqueData.js';
import MdStorageMsgRowOpaqueData from './MdStorageMsgRowOpaqueData/MdStorageMsgRowOpaqueData.js';
import MmsRetry from './MmsRetry/MmsRetry.js';
import Protocol from './Protocol/Protocol.js';
import Reporting from './Reporting/Reporting.js';
import ServerSync from './ServerSync/ServerSync.js';
import SignalLocalStorageProtocol from './SignalLocalStorageProtocol/SignalLocalStorageProtocol.js';
import SignalWhisperTextProtocol from './SignalWhisperTextProtocol/SignalWhisperTextProtocol.js';
import StatusAttributions from './StatusAttributions/StatusAttributions.js';
import SyncAction from './SyncAction/SyncAction.js';
import UserPassword from './UserPassword/UserPassword.js';
import VnameCert from './VnameCert/VnameCert.js';
import Wa6 from './Wa6/Wa6.js';
import Web from './Web/Web.js';

const proto = {
  ...Adv,
  ...AICommon,
  ...BotMetadata,
  ...Cert,
  ...ChatLockSettings,
  ...CompanionReg,
  ...DeviceCapabilities,
  ...E2E,
  ...Ephemeral,
  ...HistorySync,
  ...LidMigrationSyncPayload,
  ...MdStorageChatRowOpaqueData,
  ...MdStorageMsgRowOpaqueData,
  ...MmsRetry,
  ...Protocol,
  ...Reporting,
  ...ServerSync,
  ...SignalLocalStorageProtocol,
  ...SignalWhisperTextProtocol,
  ...StatusAttributions,
  ...SyncAction,
  ...UserPassword,
  ...VnameCert,
  ...Wa6,
  ...Web,
};

export default { proto };