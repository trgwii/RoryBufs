// CRC-16-IBM
// https://stackoverflow.com/a/23695315

const POLY = 0xA001;

export function crc16(buf: Uint8Array): number {
	let crc = 0x90f1;
	let len = buf.byteLength;
	let i = 0;
	while (len-- > 0) {
		crc ^= buf[i++];
		crc = (crc & 1) ? (crc >> 1) ^ POLY : (crc >> 1);
		crc = (crc & 1) ? (crc >> 1) ^ POLY : (crc >> 1);
		crc = (crc & 1) ? (crc >> 1) ^ POLY : (crc >> 1);
		crc = (crc & 1) ? (crc >> 1) ^ POLY : (crc >> 1);
		crc = (crc & 1) ? (crc >> 1) ^ POLY : (crc >> 1);
		crc = (crc & 1) ? (crc >> 1) ^ POLY : (crc >> 1);
		crc = (crc & 1) ? (crc >> 1) ^ POLY : (crc >> 1);
		crc = (crc & 1) ? (crc >> 1) ^ POLY : (crc >> 1);
	}
	return crc;
}
