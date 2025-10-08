// Authentication System for Invite-Only Access
class AuthSystem {
    constructor() {
        this.inviteCodeOverlay = document.getElementById('inviteCodeOverlay');
        this.registrationOverlay = document.getElementById('registrationOverlay');
        this.codeInputs = document.querySelectorAll('.code-input');
        this.proceedBtn = document.getElementById('proceedBtn');
        this.getCodeBtn = document.getElementById('getCodeBtn');
        this.confirmRegistrationBtn = document.getElementById('confirmRegistrationBtn');
        this.usernameInput = document.getElementById('usernameInput');
        this.walletInput = document.getElementById('walletInput');
        this.codeErrorMessage = document.getElementById('codeErrorMessage');
        this.registrationErrorMessage = document.getElementById('registrationErrorMessage');
        
        this.enteredCode = '';
        this.init();
    }
    
    // Generate unique 5-character referral code
    generateReferralCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 5; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    
    // Check if code already exists in database
    async isCodeUnique(code) {
        try {
            const { data, error } = await window.supabaseClient.supabase
                .from('invite_codes')
                .select('code')
                .eq('code', code)
                .single();
            
            // If no data found, code is unique
            return !data;
        } catch (error) {
            // Error likely means code doesn't exist, which is good
            return true;
        }
    }
    
    // Generate unique referral code for new player
    async generateUniqueReferralCode(maxAttempts = 10) {
        for (let i = 0; i < maxAttempts; i++) {
            const code = this.generateReferralCode();
            const isUnique = await this.isCodeUnique(code);
            
            if (isUnique) {
                console.log('✅ Generated unique referral code:', code);
                return code;
            }
            
            console.log('⚠️ Code collision, retrying...', code);
        }
        
        // Fallback: use timestamp-based code
        const timestamp = Date.now().toString(36).toUpperCase().slice(-5);
        console.log('⚠️ Using timestamp-based code:', timestamp);
        return timestamp;
    }
    
    init() {
        console.log('🔐 Auth System initialized');
        
        // Check if user is already authenticated
        const savedUsername = localStorage.getItem('herbone_username');
        const savedWallet = localStorage.getItem('herbone_wallet');
        
        if (savedUsername && savedWallet) {
            console.log('✅ User already authenticated:', savedUsername);
            this.hideOverlays();
            this.showGame();
            return;
        }
        
        // Show invite code screen
        this.inviteCodeOverlay.style.display = 'flex';
        
        // Set up code input handlers
        this.setupCodeInputs();
        
        // Set up button handlers
        this.proceedBtn.addEventListener('click', () => this.validateInviteCode());
        this.getCodeBtn.addEventListener('click', () => this.requestInviteCode());
        this.confirmRegistrationBtn.addEventListener('click', () => this.registerUser());
        
        // Allow Enter key to submit
        this.codeInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.validateInviteCode();
            });
        });
        
        this.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.walletInput.focus();
        });
        
        this.usernameInput.addEventListener('input', () => {
            this.clearError();
        });
        
        this.walletInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.registerUser();
        });
        
        this.walletInput.addEventListener('input', () => {
            this.clearError();
        });
    }
    
    setupCodeInputs() {
        this.codeInputs.forEach((input, index) => {
            // Auto-focus next input
            input.addEventListener('input', (e) => {
                const value = e.target.value.toUpperCase();
                e.target.value = value;
                
                // Clear error state when user starts typing
                this.clearError();
                
                if (value.length === 1 && index < this.codeInputs.length - 1) {
                    this.codeInputs[index + 1].focus();
                }
                
                this.updateEnteredCode();
            });
            
            // Handle backspace
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    this.codeInputs[index - 1].focus();
                }
            });
            
            // Paste handling
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pastedData = e.clipboardData.getData('text').toUpperCase().slice(0, 5);
                
                pastedData.split('').forEach((char, i) => {
                    if (this.codeInputs[i]) {
                        this.codeInputs[i].value = char;
                    }
                });
                
                this.updateEnteredCode();
                this.codeInputs[Math.min(pastedData.length, 4)].focus();
            });
        });
        
        // Focus first input
        this.codeInputs[0].focus();
    }
    
    updateEnteredCode() {
        this.enteredCode = Array.from(this.codeInputs)
            .map(input => input.value)
            .join('');
    }
    
    async validateInviteCode() {
        this.updateEnteredCode();
        
        if (this.enteredCode.length !== 5) {
            this.showError('Please enter a 5-character code');
            return;
        }
        
        console.log('🔍 Validating referral code:', this.enteredCode);
        this.proceedBtn.disabled = true;
        this.proceedBtn.textContent = 'VALIDATING...';
        
        try {
            // Check if code exists in Supabase (can be used multiple times)
            const { data, error } = await window.supabaseClient.supabase
                .from('invite_codes')
                .select('*')
                .eq('code', this.enteredCode)
                .single();
            
            if (error || !data) {
                console.error('❌ Invalid referral code');
                this.showError('Invalid referral code');
                this.proceedBtn.disabled = false;
                this.proceedBtn.textContent = 'PROCEED';
                return;
            }
            
            console.log('✅ Valid referral code! Owner:', data.owner_username);
            
            // Store code temporarily
            localStorage.setItem('herbone_invite_code', this.enteredCode);
            
            // Show registration screen
            this.showRegistrationScreen();
            
        } catch (error) {
            console.error('❌ Error validating code:', error);
            this.showError('Error validating code. Please try again.');
            this.proceedBtn.disabled = false;
            this.proceedBtn.textContent = 'PROCEED';
        }
    }
    
    showRegistrationScreen() {
        this.inviteCodeOverlay.style.display = 'none';
        this.registrationOverlay.style.display = 'flex';
        
        // Focus username input
        setTimeout(() => {
            this.usernameInput.focus();
        }, 500);
    }
    
    async registerUser() {
        const username = this.usernameInput.value.trim();
        const wallet = this.walletInput.value.trim();
        
        // Validation
        if (!username) {
            this.showError('Please enter a username');
            return;
        }
        
        if (username.length < 3) {
            this.showError('Username must be at least 3 characters');
            return;
        }
        
        if (!wallet) {
            this.showError('Please enter a wallet address');
            return;
        }
        
        // Basic Solana wallet validation (should start with alphanumeric, 32-44 chars)
        if (wallet.length < 32 || wallet.length > 44) {
            this.showError('Invalid Solana wallet address');
            return;
        }
        
        console.log('📝 Registering user:', username);
        this.confirmRegistrationBtn.disabled = true;
        this.confirmRegistrationBtn.textContent = 'CREATING ACCOUNT...';
        
        try {
            const inviteCode = localStorage.getItem('herbone_invite_code');
            
            // Get referral code info to track referrer
            const { data: referralData } = await window.supabaseClient.supabase
                .from('invite_codes')
                .select('*')
                .eq('code', inviteCode)
                .single();
            
            if (!referralData) {
                this.showError('Invalid referral code');
                this.confirmRegistrationBtn.disabled = false;
                this.confirmRegistrationBtn.textContent = 'CONFIRM';
                return;
            }
            
            const referrerUsername = referralData.owner_username;
            
            // Check if username already exists
            const { data: existingUser } = await window.supabaseClient.supabase
                .from('players')
                .select('username')
                .eq('username', username)
                .single();
            
            if (existingUser) {
                this.showError('Username already taken');
                this.confirmRegistrationBtn.disabled = false;
                this.confirmRegistrationBtn.textContent = 'CONFIRM';
                return;
            }
            
            // Generate unique referral code for this new player FIRST
            const newPlayerCode = await this.generateUniqueReferralCode();
            
            // Create player with username and track referral
            const { data: player, error: playerError } = await window.supabaseClient.supabase
                .from('players')
                .insert([{
                    username: username,
                    wallet_address: wallet,
                    referral_code: newPlayerCode,  // Their OWN code (not the one they used)
                    referred_by: referrerUsername,
                    total_bud: 0,
                    accumulated_bud: 0
                }])
                .select()
                .single();
            
            if (playerError) {
                console.error('❌ Error creating player:', playerError);
                this.showError('Error creating account. Please try again.');
                this.confirmRegistrationBtn.disabled = false;
                this.confirmRegistrationBtn.textContent = 'CONFIRM';
                return;
            }
            
            // Increment referral code usage counter
            await window.supabaseClient.supabase
                .from('invite_codes')
                .update({ 
                    times_used: referralData.times_used + 1
                })
                .eq('code', inviteCode);
            
            console.log('✅ User registered! Referred by:', referrerUsername);
            
            // Create referral code entry for new player
            const { error: codeError } = await window.supabaseClient.supabase
                .from('invite_codes')
                .insert([{
                    code: newPlayerCode,
                    owner_username: username,
                    times_used: 0,
                    total_referral_earnings: 0
                }]);
            
            if (codeError) {
                console.error('⚠️ Failed to create referral code for player:', codeError);
                // Don't fail registration if code creation fails
            } else {
                console.log('🎉 Created referral code for new player:', newPlayerCode);
            }
            
            // Save to localStorage
            localStorage.setItem('herbone_username', username);
            localStorage.setItem('herbone_wallet', wallet);
            localStorage.setItem('herbone_referral_code', newPlayerCode); // Save player's own code
            localStorage.removeItem('herbone_invite_code');
            
            console.log('✅ User registered successfully!');
            
            // Set global player
            window.currentPlayer = player;
            
            // Hide overlays and start game
            this.hideOverlays();
            
            // Reload the page to initialize the game with new player
            setTimeout(() => {
                window.location.reload();
            }, 500);
            
        } catch (error) {
            console.error('❌ Error during registration:', error);
            this.showError('Error creating account. Please try again.');
            this.confirmRegistrationBtn.disabled = false;
            this.confirmRegistrationBtn.textContent = 'CONFIRM';
        }
    }
    
    requestInviteCode() {
        // Open invite code request page (you can customize this URL)
        window.open('https://grow.game/invite', '_blank');
    }
    
    hideOverlays() {
        this.inviteCodeOverlay.style.display = 'none';
        this.registrationOverlay.style.display = 'none';
        this.showGame();
    }
    
    showGame() {
        const gameContainer = document.querySelector('.game-container');
        if (gameContainer) {
            gameContainer.classList.add('authenticated');
        }
    }
    
    showError(message) {
        // Visual feedback with error message - no alert popups
        console.error('⚠️', message);
        
        // Get active overlay and error message element
        const isCodeScreen = this.inviteCodeOverlay.style.display === 'flex';
        const activeOverlay = isCodeScreen ? this.inviteCodeOverlay : this.registrationOverlay;
        const errorMessageEl = isCodeScreen ? this.codeErrorMessage : this.registrationErrorMessage;
        
        const container = activeOverlay.querySelector('.auth-container');
        
        // Add error class for red shake animation and persistent red border
        container.classList.add('error');
        
        // Show error message
        if (errorMessageEl) {
            errorMessageEl.textContent = message;
        }
        
        // Add error class to inputs for red border
        if (isCodeScreen) {
            this.codeInputs.forEach(input => input.classList.add('error'));
        } else {
            if (this.usernameInput) this.usernameInput.classList.add('error');
            if (this.walletInput) this.walletInput.classList.add('error');
        }
    }
    
    clearError() {
        // Clear all error states
        const codeContainer = this.inviteCodeOverlay.querySelector('.auth-container');
        const regContainer = this.registrationOverlay.querySelector('.auth-container');
        
        codeContainer.classList.remove('error');
        regContainer.classList.remove('error');
        
        // Clear error messages
        if (this.codeErrorMessage) this.codeErrorMessage.textContent = '';
        if (this.registrationErrorMessage) this.registrationErrorMessage.textContent = '';
        
        // Remove error class from inputs
        this.codeInputs.forEach(input => input.classList.remove('error'));
        if (this.usernameInput) this.usernameInput.classList.remove('error');
        if (this.walletInput) this.walletInput.classList.remove('error');
    }
}

// Initialize auth system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.authSystem = new AuthSystem();
    });
} else {
    window.authSystem = new AuthSystem();
}
