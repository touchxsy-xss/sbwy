import { execFileSync } from 'node:child_process';
import { articles } from '../src/data/seed.js';
const radio = articles.find(a => a.id === 'radio');
execFileSync('/usr/bin/say', ['-v', 'Tingting', '-r', '155', '--file-format=WAVE', '--data-format=LEI16@22050', '-o', 'public/assets/community-radio.wav', radio.body]);
console.log('Generated local community radio narration.');
