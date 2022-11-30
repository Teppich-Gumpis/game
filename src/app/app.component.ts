import { Component } from '@angular/core';
import { interval } from 'rxjs';
import { play } from './audio';

interface Level {
  readonly minTime: number;
  readonly maxTime: number;
  readonly countDownFrom: number;
  readonly images: number;
}

interface Image {
  readonly name: string;
  readonly display: string;
  readonly url: string;
}

interface RunLevel {
  readonly levelImages: readonly {
    readonly image: Image;
    readonly duration: number;
  }[];
  currentImageIndex: number;
}

function randomIntFromInterval(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function getRandomItem<T>(array: T[]): T {
  return array[randomIntFromInterval(0, array.length - 1)];
}

function noSubsequentRandomItemGenerator<T>(): (array: T[]) => T {
  let lastItem: T;
  return (array: T[]) => {
    let item: T;
    while((item = getRandomItem(array)) === lastItem) {

    }
    return (lastItem = item);
  };
}

const noSubsequentRandomItem = noSubsequentRandomItemGenerator<Image>();

function createRunLevel(level: Level, images: Image[]): RunLevel {
  return {
    levelImages: Array.from({length: level.images}).map(() => {
      return {
        image: noSubsequentRandomItem(images),
        duration: randomIntFromInterval(level.minTime, level.maxTime)
      };
    }),
    currentImageIndex: 0
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  images: Image[] = [{
    name: 'pattern-1',
    display: '',
    url: '/assets/pattern-1.jpg'
  }, {
    name: 'pattern-2',
    display: '',
    url: '/assets/pattern-2.jpg'
  }, {
    name: 'pattern-3',
    display: '',
    url: '/assets/pattern-3.jpg'
  }, {
    name: 'pattern-4',
    display: '',
    url: '/assets/pattern-4.jpg'
  }, {
    name: 'pattern-5',
    display: '',
    url: '/assets/pattern-5.jpg'
  }, {
    name: 'pattern-6',
    display: '',
    url: '/assets/pattern-6.jpg'
  }, {
    name: 'pattern-7',
    display: '',
    url: '/assets/pattern-7.jpg'
  }, {
    name: 'pattern-8',
    display: '',
    url: '/assets/pattern-8.jpg'
  }];

  levels: Level[] = [{
    minTime: 15,
    maxTime: 30,
    countDownFrom: 10,
    images: 3
  }, {
    minTime: 10,
    maxTime: 20,
    countDownFrom: 5,
    images: 5
  }, {
    minTime: 8,
    maxTime: 15,
    countDownFrom: 5,
    images: 8
  }, {
    minTime: 5,
    maxTime: 10,
    countDownFrom: 3,
    images: 10
  }, {
    minTime: 4,
    maxTime: 8,
    countDownFrom: 3,
    images: 15
  }, {
    minTime: 3,
    maxTime: 5,
    countDownFrom: 2,
    images: 15
  }, {
    minTime: 1,
    maxTime: 4,
    countDownFrom: 0,
    images: 30
  }];

  currentImage = getRandomItem(this.images);
  sequence = 0;
  level = 0;
  showCountdown = false;
  countdown = 0;
  backgroundSound: Promise<AudioBufferSourceNode>;

  runLevel: RunLevel = createRunLevel(this.levels[this.level], this.images);

  constructor() {
    interval(1000).subscribe(() => this.tick());
    this.backgroundSound = play('background', {
      loop: true
    });
  }

  update() {
    const currentRunLevelImage = this.runLevel.levelImages[this.runLevel.currentImageIndex];
    this.currentImage = currentRunLevelImage.image;
    this.showCountdown = currentRunLevelImage.duration - this.sequence <= this.levels[this.level].countDownFrom;
    this.countdown = currentRunLevelImage.duration - this.sequence;
  }

  async tick() {
    const currentRunLevelImage = this.runLevel.levelImages[this.runLevel.currentImageIndex];
    this.update();

    if (this.sequence === 0) {
      play('long');

      if (this.runLevel.currentImageIndex === 0) {
        const backgroundSound = await this.backgroundSound;
        backgroundSound.stop();
        this.backgroundSound = play('background', {loop: true, detune: this.level * 100});
      }
    }

    if (this.showCountdown) {
      play('short', {detune: this.countdown * 50});
    }

    this.sequence++;

    if (this.sequence === currentRunLevelImage.duration) {
      // Next level image
      this.runLevel.currentImageIndex++;
      this.sequence = 0;

      if (this.runLevel.currentImageIndex === this.runLevel.levelImages.length) {
        // Next level
        this.level = Math.min(this.level + 1, this.levels.length - 1);
        this.runLevel = createRunLevel(this.levels[this.level], this.images);
      }
    }
  }

  reset() {
    this.level = 0;
    this.sequence = 0;
    this.runLevel = createRunLevel(this.levels[this.level], this.images);
    this.update();
  }
}
