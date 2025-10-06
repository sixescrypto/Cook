// Sound Effects System
class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.3; // 30% volume by default
        this.initAudioContext();
    }

    initAudioContext() {
        try {
            // Create AudioContext on first user interaction to avoid autoplay restrictions
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
        } catch (error) {
            console.warn('⚠️ Web Audio API not supported:', error);
            this.enabled = false;
        }
    }

    // Play ka-ching sound (cash register sound)
    playKaChing() {
        if (!this.enabled || !this.audioContext) {
            this.initAudioContext();
            if (!this.enabled || !this.audioContext) return;
        }

        const now = this.audioContext.currentTime;
        
        // Create oscillators for a pleasant "ka-ching" sound
        // First note (higher pitch)
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1047, now); // C6
        gain1.gain.setValueAtTime(this.volume, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc1.connect(gain1);
        gain1.connect(this.audioContext.destination);
        
        osc1.start(now);
        osc1.stop(now + 0.1);
        
        // Second note (mid pitch)
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(1319, now + 0.05); // E6
        gain2.gain.setValueAtTime(this.volume, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc2.connect(gain2);
        gain2.connect(this.audioContext.destination);
        
        osc2.start(now + 0.05);
        osc2.stop(now + 0.2);
        
        // Third note (highest pitch) - the "ching!"
        const osc3 = this.audioContext.createOscillator();
        const gain3 = this.audioContext.createGain();
        
        osc3.type = 'sine';
        osc3.frequency.setValueAtTime(1568, now + 0.1); // G6
        gain3.gain.setValueAtTime(this.volume * 1.2, now + 0.1);
        gain3.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        
        osc3.connect(gain3);
        gain3.connect(this.audioContext.destination);
        
        osc3.start(now + 0.1);
        osc3.stop(now + 0.35);
        
        console.log('💰 Ka-ching!');
    }

    // Play error sound
    playError() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        
        gain.gain.setValueAtTime(this.volume * 0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        osc.start(now);
        osc.stop(now + 0.2);
    }

    // Play knock/drop sound when placing items
    playKnock() {
        if (!this.enabled || !this.audioContext) {
            this.initAudioContext();
            if (!this.enabled || !this.audioContext) return;
        }

        const now = this.audioContext.currentTime;
        
        // Create a percussive "knock" sound using noise and low frequency
        const noiseBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * 0.1, this.audioContext.sampleRate);
        const noiseData = noiseBuffer.getChannelData(0);
        
        // Generate noise
        for (let i = 0; i < noiseBuffer.length; i++) {
            noiseData[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = noiseBuffer;
        
        const noiseFilter = this.audioContext.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(800, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.05);
        
        const noiseGain = this.audioContext.createGain();
        noiseGain.gain.setValueAtTime(this.volume * 0.6, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        
        noise.start(now);
        noise.stop(now + 0.08);
        
        // Add a low frequency thud
        const osc = this.audioContext.createOscillator();
        const oscGain = this.audioContext.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        
        oscGain.gain.setValueAtTime(this.volume * 0.8, now);
        oscGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        osc.connect(oscGain);
        oscGain.connect(this.audioContext.destination);
        
        osc.start(now);
        osc.stop(now + 0.1);
        
        console.log('🔨 Knock!');
    }

    // Play rotation sound when rotating items
    playRotate() {
        if (!this.enabled) return;

        // Option 1: Use custom audio file (if you have one)
        const audio = new Audio('assets/sounds/rotate.mp3'); // Change this to your sound file path
        audio.volume = Math.min(1.0, this.volume * 3.0); // 200% louder (3x volume)
        audio.play().catch(err => {
            console.warn('⚠️ Could not play rotate sound:', err);
            // Fallback to synthesized sound if audio file fails
            this.playSynthRotate();
        });
        
        console.log('🔄 Rotate!');
    }

    // Synthesized rotation sound (fallback)
    playSynthRotate() {
        if (!this.audioContext) {
            this.initAudioContext();
            if (!this.audioContext) return;
        }

        const now = this.audioContext.currentTime;
        
        // Create a quick "whoosh" rotation sound using sweep and noise
        // High frequency sweep down (whoosh effect)
        const osc1 = this.audioContext.createOscillator();
        const gain1 = this.audioContext.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(800, now);
        osc1.frequency.exponentialRampToValueAtTime(400, now + 0.08);
        
        gain1.gain.setValueAtTime(this.volume * 0.4, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        osc1.connect(gain1);
        gain1.connect(this.audioContext.destination);
        
        osc1.start(now);
        osc1.stop(now + 0.08);
        
        // Add a subtle click at the end (item settling)
        const osc2 = this.audioContext.createOscillator();
        const gain2 = this.audioContext.createGain();
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(600, now + 0.08);
        
        gain2.gain.setValueAtTime(this.volume * 0.5, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        
        osc2.connect(gain2);
        gain2.connect(this.audioContext.destination);
        
        osc2.start(now + 0.08);
        osc2.stop(now + 0.12);
    }

    // Toggle sound on/off
    toggle() {
        this.enabled = !this.enabled;
        console.log(`🔊 Sound effects ${this.enabled ? 'enabled' : 'disabled'}`);
        return this.enabled;
    }

    // Set volume (0.0 to 1.0)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        console.log(`🔊 Volume set to ${Math.round(this.volume * 100)}%`);
    }
}

// Create global sound effects instance
window.soundEffects = new SoundEffects();
