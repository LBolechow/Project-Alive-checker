describe('Weryfikacja poprawności adresu IP za pomocą wyrażenia regularnego', () => {
    const ipRegex = /^(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[0-1]?[0-9][0-9]?)$/;

    it('powinno zwrócić prawdę dla poprawnego adresu IP', () => {
        const validIp = '192.168.1.1';
        const result = ipRegex.test(validIp);
        expect(result).to.be.true;
    });

    it('powinno zwrócić fałsz dla niepoprawnego adresu IP', () => {
        const invalidIp = '999.999.999.999';
        const result = ipRegex.test(invalidIp);
        expect(result).to.be.false;
    });

    it('powinno zwrócić fałsz dla niepełnego adresu IP', () => {
        const incompleteIp = '192.168.1';
        const result = ipRegex.test(incompleteIp);
        expect(result).to.be.false;
    });

    it('powinno zwrócić fałsz dla adresu IP zawierającego litery', () => {
        const invalidIp = '192.abc.1.1';
        const result = ipRegex.test(invalidIp);
        expect(result).to.be.false;
    });

    it('powinno zwrócić prawdę dla skrajnego przypadku adresu IP (255.255.255.255)', () => {
        const validIp = '255.255.255.255';
        const result = ipRegex.test(validIp);
        expect(result).to.be.true;
    });

    it('powinno zwrócić fałsz dla adresu IP z liczbami ujemnymi', () => {
        const invalidIp = '192.-168.1.1';
        const result = ipRegex.test(invalidIp);
        expect(result).to.be.false;
    });
});
describe('Webview Button Tests', () => {
    it('Clicks buttons and validates responses', () => {
        cy.visit('vscode-resource://path-to-webview'); // Zmień na ścieżkę swojego webview

        // Sprawdzenie tytułu
        cy.contains('Ping Address:');

        // Kliknięcie przycisku Standard Ping
        cy.get('#pingButton').click();

        // Sprawdzenie, czy pojawiła się odpowiedź
        cy.get('#output').should('not.contain', 'No response yet...');
        
        // Kliknięcie przycisku Ping with TTL
        cy.get('#pingWithTTL').click();

        // Sprawdzenie logów z TTL
        cy.get('#output').should('contain', 'TTL');

        // Test Ping Large Packet
        cy.get('#pingLargePacket').click();

        // Sprawdzenie wyników dużego pakietu
        cy.get('#output').should('contain', 'bytes=1024');
    });

    it('Clears the console and checks for empty output', () => {
        // Kliknięcie Clear Console
        cy.get('#clearButton').click();

        // Sprawdzenie, czy konsola została wyczyszczona
        cy.get('#output').should('contain', 'No response yet...');
    });
});